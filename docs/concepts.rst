Template 
========

A template is composed of three elements: 

- Template Grammar, the natural language text for the template 
- Template Model, the data model that backs the template 
- Logic, the executable business logic for the template

.. image:: images/template.png

When combined these three elements allow templates to be edited, analyzed, queried and executed.

A complete sample template is available here:
https://github.com/accordproject/cicero-template-library/tree/master/latedeliveryandpenalty

Template Grammar 
----------------

The template grammar for a template captures the natural language structure of the template. It is
UTF-8 text with markup to introduce named variables.

Here is a simple template grammar for a smart clause::

   Late Delivery and Penalty. In case of delayed delivery[{" except for Force
   Majeure cases,":? forceMajeure}] the Seller shall pay to the Buyer for every
   [{penaltyDuration}] of delay penalty amounting to [{penaltyPercentage}]% of
   the total value of the Equipment whose delivery has been delayed. Any
   fractional part of a [{fractionalPart}] is to be considered a full
   [{fractionalPart}]. The total amount of penalty shall not however, exceed
   [{capPercentage}]% of the total value of the Equipment involved in late
   delivery. If the delay is more than [{termination}], the Buyer is entitled to
   terminate this Contract.

Variables in template grammars are enclosed in ``[{`` and ``}]``.

Templates grammars for contracts can also contain references to clause templates for example::

    ...
    2. Copyright Notices. Licensee shall ensure that its use of the Work is marked with the appropriate copyright notices specified by Licensor in a reasonably prominent position in the order and manner provided by Licensor. Licensee shall abide by the copyright laws and what are considered to be sound practices for copyright notice provisions in the Territory. Licensee shall not use any copyright notices that conflict with, confuse, or negate the notices Licensor provides and requires hereunder.

    3. [{#paymentClause}]Payment. As consideration in full for the rights granted herein, Licensee shall pay Licensor a one-time fee in the amount of [{amountText}] US Dollars (US $[{amount}]) upon execution of this Agreement, payable as follows: [{paymentProcedure}]. [{/paymentClause}] 

    4. General. ...

In-line clause references are enclosed with ``[{#CLAUSE_NAME}]`` and ``[{/CLAUSE_NAME}]``. Where ``CLAUSE_NAME`` matches the identifier of the Clause given in the template model (see below). 

Template Model
--------------

The model for a template captures the names and types of the variables. 
Template models are expressed using the `Hyperledger Composer Modeling Language`_, a runtime neutral, 
text-based data-definition (schema) language.

.. _`Hyperledger Composer Modeling Language`: https://hyperledger.github.io/composer/reference/cto_language.html

Here is a sample template model::

    @AccordTemplateModel("latedeliveryandpenalty")
    concept TemplateModel {
        /* Does the clause include a force majeure provision? */
        o Boolean forceMajeure

        /* For every penaltyDuration that the goods are late */
        o Duration penaltyDuration

        /* Seller pays the buyer penaltyPercentage % of the value of the goods */
        o Double penaltyPercentage

        /* Up to capPercentage % of the value of the goods */
        o Double capPercentage

        /* If the goods are >= termination late then the buyer may terminate the contract */
        o Duration termination

        /* Fractional part of a ... is considered a whole ... */
        o TemporalUnit fractionalPart
    }

The template model for a contract can contain Clause declarations too, for example, ``paymentClause`` in the snippet below::

    import org.accordproject.common.ClauseModel
    
    @AccordTemplateModel("copyright-license")
    concept TemplateModel {
        /* licensee */
        o String licenseeName
        o String licenseeState
        o String licenseeEntityType
        o String licenseeAddress

        ...

        /* payment */
        o PaymentClauseModel paymentClause
    }

    asset PaymentClauseModel extends ClauseModel {
        o String amountText
        o Double amount
        o String paymentProcedure
    }

In this example ``paymentClause`` refers to a separate model definition that describes the structure of an inline payment clause, ``PaymentClauseModel``.

This allows you to build contracts that are composed of reusable clause definitions.

.. note:: Clause models are ``asset``s not ``concept``s and extend the built-in ``ClauseModel`` model.

Template Logic 
--------------

The logic for a template is written in Ergo, a domain specific language for smart legal contracts. The Ergo clauses are
invoked by the engine when transactions are received for processing and return a response. Both the 
incoming requests and responses are modeled types.

Here is a sample Ergo contract::

    namespace io.clause.latedeliveryandpenalty

    // Imports CTO files
    import org.accordproject.contract.*
    import io.clause.latedeliveryandpenalty.*
    // Date and time library
    import ergo.moment.*

    contract SupplyAgreement over SupplyAgreementModel {
        // Clause checking for late delivery and calculating penalty
        clause latedeliveryandpenalty(request : LateDeliveryAndPenaltyRequest) : LateDeliveryAndPenaltyResponse throws Error {
            // Guard against calling late delivery clause too early
            define variable agreed = request.agreedDelivery;
            enforce momentIsBefore(agreed,now()) else
                throw new Error{ message : "Cannot exercise late delivery before delivery date" }
            ;

            // Guard against force majeure
            enforce !contract.forceMajeure or !request.forceMajeure else
                return new LateDeliveryAndPenaltyResponse{
                    penalty: 0.0,
                    buyerMayTerminate: true
                }
            ;

            // Calculate the time difference between current date and agreed upon date
            define variable diff = momentDiff(now,agreed);
            
            // Penalty formula
            define variable penalty =
                (diff / contract.penaltyDuration.amount) * contract.penaltyPercentage/100.0 * request.goodsValue;
            
            // Penalty may be capped
            define variable capped = min([penalty,contract.capPercentage * request.goodsValue / 100.0]);
            
            // Return the response with the penalty and termination determination
            return new LateDeliveryAndPenaltyResponse{
                penalty: capped,
                buyerMayTerminate: diff > contract.termination.amount
            }
        }
    }

Template Library 
================

Templates may be organized into a Template Library, typically stored on GitHub (either public or private).
For example:
https://github.com/accordproject/cicero-template-library

Clauses & Contracts
===================

A Clauses and Contracts are instances of a Template, where the variables for the template have been set to specific values.
A Clause or Contract may be instantiated by either parsing natural language text that conforms to the structure of the 
template grammar, or may be instantiated from a JSON object that is an instance of the Template Model for the
template.

Engine 
======

Cicero includes a Node.js VM based execution engine. The engine routes incoming transactions to template functions,
performs data validation, executes the functions within a sandboxed environment, and then validates the response
before returning it to the caller.

.. image:: images/execution_context.png