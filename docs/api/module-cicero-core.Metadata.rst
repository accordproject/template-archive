.. _module-cicero-core.Metadata:

===================
Class: ``Metadata``
===================

Member Of :doc:`module-cicero-core`

.. contents:: Local Navigation
   :local:

Children
========

.. toctree::
   :maxdepth: 1
   
   
Description
===========

<p>Create the Metadata.</p>
<p><br><strong>Note: Only to be called by framework code. Applications should<br>retrieve instances from {@link Template}</strong><br></p>


.. _module-cicero-core.Metadata._validName:


Function: ``_validName``
========================

<p>check to see if it is a valid name. for some reason regex is not working when this executes<br>inside the chaincode runtime, which is why regex hasn't been used.</p>

.. js:function:: _validName(name)

    
    :param string name: <p>the template name to check</p>
    :return boolean: <p>true if valid, false otherwise</p>
    
.. _module-cicero-core.Metadata.getREADME:


Function: ``getREADME``
=======================

<p>Returns the README.md for this template. This may be null if the template does not have a README.md</p>

.. js:function:: getREADME()

    
    :return String: <p>the README.md file for the template or null</p>
    
.. _module-cicero-core.Metadata.getPackageJson:


Function: ``getPackageJson``
============================

<p>Returns the package.json for this template.</p>

.. js:function:: getPackageJson()

    
    :return object: <p>the Javascript object for package.json</p>
    
.. _module-cicero-core.Metadata.getName:


Function: ``getName``
=====================

<p>Returns the name for this template.</p>

.. js:function:: getName()

    
    :return string: <p>the name of the template</p>
    
.. _module-cicero-core.Metadata.getDescription:


Function: ``getDescription``
============================

<p>Returns the description for this template.</p>

.. js:function:: getDescription()

    
    :return string: <p>the description of the template</p>
    
.. _module-cicero-core.Metadata.getVersion:


Function: ``getVersion``
========================

<p>Returns the version for this template.</p>

.. js:function:: getVersion()

    
    :return string: <p>the description of the template</p>
    
.. _module-cicero-core.Metadata.getIdentifier:


Function: ``getIdentifier``
===========================

<p>Returns the identifier for this template, formed from name@version.</p>

.. js:function:: getIdentifier()

    
    :return string: <p>the identifier of the template</p>
    

.. _module-cicero-core.Metadata.packageJson:

Member: ``packageJson``: 

.. _module-cicero-core.Metadata.readme:

Member: ``readme``: 




