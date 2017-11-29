.. _module-cicero-core.GrammarVisitor:

=========================
Class: ``GrammarVisitor``
=========================

Member Of :doc:`module-cicero-core`

.. contents:: Local Navigation
   :local:

Children
========

.. toctree::
   :maxdepth: 1
   
   
Description
===========




.. _module-cicero-core.GrammarVisitor.visit:


Function: ``visit``
===================

<p>Visitor design pattern</p>

.. js:function:: visit(thing, parameters)

    
    :param Object thing: <p>the object being visited</p>
    :param Object parameters: <p>the parameter</p>
    :return Object: <p>the result of visiting or null</p>
    
.. _module-cicero-core.GrammarVisitor.visitModelManager:


Function: ``visitModelManager``
===============================

<p>Visitor design pattern</p>

.. js:function:: visitModelManager(modelManager, parameters)

    
    :param ModelManager modelManager: <p>the object being visited</p>
    :param Object parameters: <p>the parameter</p>
    :return Object: <p>the result of visiting or null</p>
    
.. _module-cicero-core.GrammarVisitor.visitModelFile:


Function: ``visitModelFile``
============================

<p>Visitor design pattern</p>

.. js:function:: visitModelFile(modelFile, parameters)

    
    :param ModelFile modelFile: <p>the object being visited</p>
    :param Object parameters: <p>the parameter</p>
    :return Object: <p>the result of visiting or null</p>
    
.. _module-cicero-core.GrammarVisitor.visitEnumDeclaration:


Function: ``visitEnumDeclaration``
==================================

<p>Visitor design pattern</p>

.. js:function:: visitEnumDeclaration(enumDeclaration, parameters)

    
    :param EnumDeclaration enumDeclaration: <p>the object being visited</p>
    :param Object parameters: <p>the parameter</p>
    :return Object: <p>the result of visiting or null</p>
    
.. _module-cicero-core.GrammarVisitor.visitClassDeclaration:


Function: ``visitClassDeclaration``
===================================

<p>Visitor design pattern</p>

.. js:function:: visitClassDeclaration(classDeclaration, parameters)

    
    :param ClassDeclaration classDeclaration: <p>the object being visited</p>
    :param Object parameters: <p>the parameter</p>
    :return Object: <p>the result of visiting or null</p>
    
.. _module-cicero-core.GrammarVisitor.visitField:


Function: ``visitField``
========================

<p>Visitor design pattern</p>

.. js:function:: visitField(field, parameters)

    
    :param Field field: <p>the object being visited</p>
    :param Object parameters: <p>the parameter</p>
    :return Object: <p>the result of visiting or null</p>
    
.. _module-cicero-core.GrammarVisitor.visitEnumValueDeclaration:


Function: ``visitEnumValueDeclaration``
=======================================

<p>Visitor design pattern</p>

.. js:function:: visitEnumValueDeclaration(enumValueDeclaration, parameters)

    
    :param EnumValueDeclaration enumValueDeclaration: <p>the object being visited</p>
    :param Object parameters: <p>the parameter</p>
    :return Object: <p>the result of visiting or null</p>
    
.. _module-cicero-core.GrammarVisitor.visitRelationshipDeclaration:


Function: ``visitRelationshipDeclaration``
==========================================

<p>Visitor design pattern</p>

.. js:function:: visitRelationshipDeclaration(relationship, parameters)

    
    :param Relationship relationship: <p>the object being visited</p>
    :param Object parameters: <p>the parameter</p>
    :return Object: <p>the result of visiting or null</p>
    
.. _module-cicero-core.GrammarVisitor.toGrammarType:


Function: ``toGrammarType``
===========================

<p>Converts a Composer type to a Nearley grammar type.</p>

.. js:function:: toGrammarType(type)

    
    :param string type: <p>the composer type</p>
    :return string: <p>the corresponding type to use for Nearley</p>
    




