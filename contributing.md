# Contributing to Cicero

> Thanks to the angularJS team for the bulk of this text!

We'd love for you to contribute to our source code and to make Cicero even better than it is today! Here are the guidelines we'd like you to follow:

* [Code of Conduct](contributing.md#coc)
* [Questions and Problems](contributing.md#question)
* [Issues and Bugs](contributing.md#issue)
* [Feature Requests](contributing.md#feature)
* [Improving Documentation](contributing.md#docs)
* [Issue Submission Guidelines](contributing.md#submit)
* [Pull Request Submission Guidelines](contributing.md#submit-pr)
* [Signing the CLA](contributing.md#cla)

##  Code of Conduct

Help us keep Cicero open and inclusive. Please read and follow our [Code of Conduct](https://github.com/accordproject/code-of-conduct/blob/master/CODE_OF_CONDUCT.md).

##  Questions, Bugs, Features

###  Got a Question or Problem?

Do not open issues for general support questions as we want to keep GitHub issues for bug reports and feature requests. You've got much better chances of getting your question answered on dedicated support platforms, the best being \[Stack Overflow\]\[stackoverflow\].

Stack Overflow is a much better place to ask questions since:

* there are thousands of people willing to help on Stack Overflow
* questions and answers stay available for public viewing so your question / answer might help

  someone else

* Stack Overflow's voting system assures that the best answers are prominently visible.

To save your and our time, we will systematically close all issues that are requests for general support and redirect people to the section you are reading right now.

Other channels for support are:

* the \[Cicero Slack Channel\]\[slack\]

###  Found an Issue or Bug?

If you find a bug in the source code, you can help us by submitting an issue to our [GitHub Repository](https://github.com/accordproject/cicero). Even better, you can submit a Pull Request with a fix.

**Please see the **[**Submission Guidelines**](contributing.md#submit)** below.**

###  Missing a Feature?

You can request a new feature by submitting an issue to our [GitHub Repository](https://github.com/accordproject/cicero/issues).

If you would like to implement a new feature then consider what kind of change it is:

* **Major Changes** that you wish to contribute to the project should be discussed first in an

  [GitHub issue](https://github.com/accordproject/cicero/issues) that clearly outlines the changes and benefits of the feature.

* **Small Changes** can directly be crafted and submitted to the [GitHub Repository](https://github.com/accordproject/cicero)

  as a Pull Request. See the section about [Pull Request Submission Guidelines](contributing.md#submit-pr), and

  for detailed information the [core development documentation](developers.md).

###  Want a Doc Fix?

Should you have a suggestion for the documentation, you can open an issue and outline the problem or improvement you have - however, creating the doc fix yourself is much better!

If you want to help improve the docs, it's a good idea to let others know what you're working on to minimize duplication of effort. Create a new issue \(or comment on a related existing one\) to let others know what you're working on.

If you're making a small change \(typo, phrasing\) don't worry about filing an issue first. Use the friendly blue "Improve this doc" button at the top right of the doc page to fork the repository in-place and make a quick change on the fly. The commit message is preformatted to the right type and scope, so you only have to add the description.

For large fixes, please build and test the documentation before submitting the PR to be sure you haven't accidentally introduced any layout or formatting issues. You should also make sure that your commit message follows the [**Commit Message Guidelines**](developers.md#commits).

##  Issue Submission Guidelines

Before you submit your issue search the archive, maybe your question was already answered.

If your issue appears to be a bug, and hasn't been reported, open a new issue. Help us to maximize the effort we can spend fixing issues and adding new features, by not reporting duplicate issues.

The "[new issue](https://github.com/accordproject/cicero/issues/new)" form contains a number of prompts that you should fill out to make it easier to understand and categorize the issue.

**If you get help, help others. Good karma rulez!**

##  Pull Request Submission Guidelines

Before you submit your pull request consider the following guidelines:

* Search [GitHub](https://github.com/accordproject/cicero/pulls) for an open or closed Pull Request

  that relates to your submission. You don't want to duplicate effort.

* Create the [development environment](developers.md#setup)
* Make your changes in a new git branch:

  ```text
    git checkout -b my-fix-branch master
  ```

* Create your patch commit, **including appropriate test cases**.
* Follow our [Coding Rules](developers.md#rules).
* If the changes affect public APIs, change or add relevant [documentation](developers.md#documentation).
* Run the [unit](developers.md#unit-tests) and [E2E test](developers.md#e2e-tests) suites, and ensure that all tests

  pass.

* Commit your changes using a descriptive commit message that follows our [commit message conventions](developers.md#commits). Adherence to the [commit message conventions](developers.md#commits) is required, because release notes are automatically generated from these messages.

  ```text
    git commit -a
  ```

  Note: the optional commit `-a` command line option will automatically "add" and "rm" edited files.

* Before creating the Pull Request, package and run all tests a last time:

  ```text
    lerna run test
  ```

* Push your branch to GitHub:

  ```text
    git push origin my-fix-branch
  ```

* In GitHub, send a pull request to `cicero:master`. This will trigger the check of the [Contributor License Agreement](contributing.md#cla) and the Travis integration.
* If you find that the Travis integration has failed, look into the logs on Travis to find out if your changes caused test failures, the commit message was malformed etc. If you find that the tests failed or times out for unrelated reasons, you can ping a team member so that the build can be restarted.
* If we suggest changes, then:
  * Make the required updates.
  * Re-run the test suite to ensure tests are still passing.
  * Commit your changes to your branch \(e.g. `my-fix-branch`\).
  * Push the changes to your GitHub repository \(this will update your Pull Request\).

    You can also amend the initial commits and force push them to the branch.

    ```text
    git rebase master -i
    git push origin my-fix-branch -f
    ```

    This is generally easier to follow, but seperate commits are useful if the Pull Request contains iterations that might be interesting to see side-by-side.

That's it! Thank you for your contribution!

#### After your pull request is merged

After your pull request is merged, you can safely delete your branch and pull the changes from the main \(upstream\) repository:

* Delete the remote branch on GitHub either through the GitHub web UI or your local shell as follows:

  ```text
    git push origin --delete my-fix-branch
  ```

* Check out the master branch:

  ```text
    git checkout master -f
  ```

* Delete the local branch:

  ```text
    git branch -D my-fix-branch
  ```

* Update your master with the latest upstream version:

  ```text
    git pull --ff upstream master
  ```

##  Signing the Contributor License Agreement \(CLA\)

Upon submmitting a Pull Request, a friendly bot will ask you to sign our CLA if you haven't done so before. Unfortunately, this is necessary for documentation changes, too. It's a quick process, we promise!

* For individuals we have a [simple click-through form](http://code.google.com/legal/individual-cla-v1.0.html).
* For corporations we'll need you to

  [print, sign and one of scan+email, fax or mail the form](http://code.google.com/legal/corporate-cla-v1.0.html).

\[stackoverflow\]: [http://stackoverflow.com/questions/tagged/cicero](http://stackoverflow.com/questions/tagged/cicero)

