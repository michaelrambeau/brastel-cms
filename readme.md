A web application to manage brastel.com multilingual content

## Requirements

From end-users point of view: we need multilingual, mobile-friendly, and fast pages.

From the marketing point of view: we need a way to update easily elements such as the “message board” (used to display news about the company), the FAQs, the banners of the top page, without using external Wordpress website. Marketing also need to send mails and manage mass-mailing campaigns easily.

From the translators point of view: we need a single interface to translate all content: single items used in pages, Message board, FAQs…

From the IT manager point of view: we have to save money using less servers, avoid the cost of MicroSoft licenses and the fuss of the upgrades. We have to save money on administration tasks and focus on delivering content. We cannot afford interruption of services (it was not possible to access brastelremit.jp today in the morning!)

From the developers point of view: we need a system to build easily pages that can include translations from any category, without the fuss of WIMS (XSL registration, associations...) 

## The implemented solution

An open-source node.js application that takes advantages of modern technogies and services in the cloud.

Features
* Login with Google account
* Etext items
* Keyword
* Blog entries
* FAQ entries


Technologies
* node.js
* mongoDB
* KeystoneJS (a CMS built on top of node.js)