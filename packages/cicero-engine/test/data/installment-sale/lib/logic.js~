/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable no-var */

/**
 * Execute the smart clause
 * @param {Context} context - the Accord context
 * @param {org.accordproject.installmentsale.Installment} context.request - the incoming request
 * @param {org.accordproject.installmentsale.Balance} context.response - the response
 * @AccordClauseLogic
 */
function payInstallment(context) {
    var req = context.request;
    var res = context.response;
    var contract = context.contract;
    var state = context.state;
    var emit = context.emit;

    if (state.status !== 'WaitingForFirstDayOfNextMonth') {
        throw new Error('Cannot pay when status is ' + context.state.status);
    }
    if (!(contract.MIN_PAYMENT <= state.balance_remaining && state.next_payment_month < 23)) {
        throw new Error('Cannot use this clause when balance under minimum: ' + contract.MIN_PAYMENT + ' -- also cannot pay after installments after 23rd month');
    }
    if (!(contract.MIN_PAYMENT <= req.amount)) {
        throw new Error('Cannot pay installment under minimum amount:' + contract.MIN_PAYMENT);
    }
    if (!(request.amount < state.balance_remaining)) {
        throw new Error('Cannot overpay, the current balance is: ' + state.balance_remaining);
    }
    const before_interest = state.balance_remaining - req.amount;
    const balance = before_interest * (1.0 + contract.INTEREST_RATE/100.00);
    const total_paid = state.total_paid + req.amount;

    // Create the response
    res.balance = balance;
    res.total_paid = total_paid;

    // Declare the new state
    context.state =
        serializer.fromJSON({
            '$class' : 'org.accordproject.installmentsale.InstallmentSaleState',
            'stateId' : state.stateId,
            'status' :'WaitingForFirstDayOfNextMonth',
            'balance_remaining' : balance,
            'total_paid' : total_paid,
            'next_payment_month' : state.next_payment_month + 1
        });

    // Emit payment obligation
    emit.push(serializer.fromJSON({
        '$class': 'org.accordproject.installmentsale.PaymentObligation',
        'party':contract.BUYER,
        'amount':req.amount
    }));
}

/**
 * Execute the smart clause
 * @param {Context} context - the Accord context
 * @param {org.accordproject.installmentsale.ClosingPayment} context.request - the incoming request
 * @param {org.accordproject.installmentsale.Balance} context.response - the response
 * @AccordClauseLogic
 */
function payLastInstallment(context) {
    var req = context.request;
    var res = context.response;
    var contract = context.contract;
    var state = context.state;
    var emit = context.emit;

    var total_remaining = state.balance_remaining + contract.DUE_AT_CLOSING;
    if (!(req.amount == total_remaining)) {
        throw new Error('Cannot only pay the full amount at last installment: ' + total_remaining);
    }
    const total_paid = state.total_paid + req.amount;

    // Create the response
    res.balance = 0.0;
    res.total_paid = total_paid;

    // Declare the new state
    context.state =
        serializer.fromJSON({
            '$class' : 'org.accordproject.installmentsale.InstallmentSaleState',
            'stateId' : state.stateId,
            'status' :'Fulfilled',
            'balance_remaining' : 0.0,
            'total_paid' : total_paid,
            'next_payment_month' : 0.0
        });

    // Emit payment obligation
    emit.push(serializer.fromJSON({
        '$class': 'org.accordproject.installmentsale.PaymentObligation',
        'party':contract.BUYER,
        'amount':req.amount
    }));
}

/* eslint-enable no-unused-vars */
/* eslint-enable no-undef */
