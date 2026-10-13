# FlyRank.ai Internship --- Backend AI Engineering (Node.js)

A record of my learning journey, practical assignments, and capstone
project completed during the **FlyRank.ai remote, self-paced
internship** in the **Backend AI Engineering** track.

> **Status:** Capstone submitted and currently under review.\
> **Focus:** Backend development with Node.js and Express, databases,
> authentication, AI API integration, validation, testing, and API
> documentation.

## Table of Contents

-   [About the Internship](#about-the-internship)
-   [Learning Journey](#learning-journey)
-   [Assignments](#assignments)
    -   [Assignment 1 --- CRUD API](#assignment-1--crud-api)
    -   [Assignment 2 --- MongoDB and
        Mongoose](#assignment-2--mongodb-and-mongoose)
    -   [Assignment 3 --- Supabase
        Authentication](#assignment-3--supabase-authentication)
    -   [Assignment 4 --- AI-Powered Support Message
        Triage](#assignment-4--ai-powered-support-message-triage)
    -   [Assignment 5 --- PDF Report
        Generator](#assignment-5--pdf-report-generator)
-   [Capstone Project](#capstone-project)
-   [Technology Stack](#technology-stack)
-   [Key Learnings](#key-learnings)
-   [Repository Contents](#repository-contents)
-   [Acknowledgements](#acknowledgements)

## About the Internship

I completed the practical assignments in FlyRank.ai's **Backend AI
Engineering (Node.js)** track. The internship helped me build a
foundation in server-side JavaScript and progressively apply it to APIs,
databases, authentication, AI integration, automated testing, and report
generation.

The work was completed remotely and at a self-paced schedule. This
repository serves as a learning record and a place to organize the
assignment and capstone work associated with the internship.

-   **Platform:** [FlyRank.ai
    Internship](https://internship.flyrank.ai/)
-   **Track:** Backend AI Engineering
-   **Primary language/runtime:** JavaScript with Node.js
-   **Backend framework:** Express.js
-   **Capstone:** Image Relevance & Auto-Tagging

## Learning Journey

The work progressed from foundational backend concepts to more
integrated applications:

1.  **Node.js and npm fundamentals** --- understanding the runtime,
    packages, and project setup.
2.  **JavaScript module systems** --- working with CommonJS and
    ECMAScript Modules.
3.  **Express APIs** --- handling requests and responses, routes, and
    middleware.
4.  **Database integration** --- connecting backend applications to
    MongoDB and using Mongoose.
5.  **Authentication and protected routes** --- integrating Supabase
    authentication with an Express API.
6.  **AI API integration** --- connecting an application to the Gemini
    API for support-message triage.
7.  **Validation and testing** --- using Zod, Vitest, and Supertest in
    the AI-powered API assignment.
8.  **PDF generation and API documentation** --- creating PDF reports
    and exploring security and documentation tools.
9.  **Capstone development** --- applying backend and AI integration
    concepts to an image relevance and auto-tagging project.

## Assignments

### Assignment 1 --- CRUD API

**Focus:** Node.js, npm, and Express fundamentals.

This assignment introduced the structure of a Node.js backend and the
process of building a CRUD-style API. It provided practical experience
with Express routes and the request/response cycle.

**Concepts practised** - Setting up a Node.js project and managing
packages with npm. - Understanding CommonJS and ECMAScript Modules. -
Defining API routes and handling HTTP requests and responses. -
Organizing basic backend logic.

### Assignment 2 --- MongoDB and Mongoose

**Focus:** Database connectivity and data operations.

This assignment extended the backend with MongoDB and Mongoose,
introducing the role of a database in persisting application data.

**Concepts practised** - Connecting a Node.js application to MongoDB. -
Understanding Mongoose and model-based data access. - Performing CRUD
operations against stored data. - Keeping database configuration
separate from application logic.

### Assignment 3 --- Supabase Authentication

**Project:** `assignment-3-auth-login-protect`\
**Focus:** Secure Express API with Supabase authentication and protected
routes.

This assignment focused on adding authentication to an Express API and
restricting access to protected routes.

**Technologies and concepts** - Express.js - Supabase JavaScript client
(`@supabase/supabase-js`) - Environment configuration with `dotenv` -
Login/authentication flow and protected endpoints - ES Modules
(`"type": "module"`) - Development workflow using Node.js watch mode

**Learning outcome:** Understanding how authentication fits into an API
and why protected routes must verify access rather than assume that a
request is trusted.

### Assignment 4 --- AI-Powered Support Message Triage

**Focus:** Integrating the Gemini API into an application workflow.

This assignment involved a support-message triage API powered by the
Gemini API. The project also included a React/Vite frontend and tools
for validating data and testing API behaviour.

**Technologies** - Node.js and Express.js - Gemini API - Zod for schema
validation - React and Vite - Vitest and Supertest for testing

**Concepts practised** - Calling an external AI API from a backend
service. - Structuring and validating application data. - Connecting a
frontend to backend functionality. - Testing code and HTTP endpoints. -
Considering how an application should handle unexpected or invalid
inputs.

### Assignment 5 --- PDF Report Generator

**Focus:** Generating PDF reports in a backend application.

This assignment brought together backend routes, data access, document
generation, security-related middleware, and API documentation.

**Technologies** - Node.js and Express.js - MongoDB Node.js driver -
PDFKit - Helmet - Swagger UI Express - Node.js test runner

**Concepts practised** - Generating PDF documents programmatically. -
Working with data from MongoDB. - Adding security-related HTTP headers
with Helmet. - Documenting API endpoints with Swagger UI. - Using tests
to check application behaviour.

## Capstone Project

### Image Relevance & Auto-Tagging

**Status:** Submitted to FlyRank.ai and currently under review.

The capstone focuses on using AI to help analyse images and produce
useful descriptive metadata. The intended purpose of auto-tagging is to
make images easier to categorize and discover. Image relevance is the
related task of assessing how well an image matches a given topic or
query.

The project was selected as the capstone for the Backend AI Engineering
track and developed with the assistance of Cursor AI.

**Planned/core technical areas** - Node.js and Express.js for backend
API functionality. - Gemini API for AI-assisted image analysis. - Zod
for validating structured data. - MongoDB for persisting analysis
records. - API request/response handling and error management.

> The precise feature set, endpoint names, and implementation details
> should be taken from the submitted source code. This README
> intentionally does not claim specific routes, evaluation scores,
> deployment URLs, or results that are not documented here.

## Technology Stack

  Area                      Technologies / Tools
  ------------------------- -------------------------------------------
  Language and runtime      JavaScript, Node.js
  Package management        npm
  Backend                   Express.js
  Database                  MongoDB, Mongoose, MongoDB Node.js driver
  Authentication            Supabase
  AI integration            Gemini API
  Validation                Zod
  Frontend (Assignment 4)   React, Vite
  Testing                   Vitest, Supertest, Node.js test runner
  PDF generation            PDFKit
  Security middleware       Helmet
  API documentation         Swagger UI Express
  Development assistance    Cursor AI

*Not every technology above is used in every assignment; the stack
varies by project.*

## Key Learnings

Through the assignments and capstone, I gained practical experience
with:

-   Building and organizing Node.js applications.
-   Creating REST-style APIs with Express.
-   Working with asynchronous backend operations and external services.
-   Connecting applications to MongoDB and modelling stored data.
-   Implementing authentication-aware API routes.
-   Integrating an AI API into a backend workflow.
-   Validating data and testing endpoints.
-   Generating downloadable documents such as PDF reports.
-   Documenting APIs and considering backend security.
-   Using an AI coding assistant as a development aid while reviewing
    and understanding the generated code.

## Repository Contents

This repository contains my internship learning materials and project
work. The exact folder names and contents may evolve as the projects are
organized.

Typical sections include:

-   Assignment 1: CRUD API
-   Assignment 2: MongoDB and Mongoose
-   Assignment 3: Supabase authentication and protected routes
-   Assignment 4: Gemini-powered support-message triage
-   Assignment 5: PDF report generator
-   Capstone: Image Relevance & Auto-Tagging

Please open each assignment's own folder and README (if available) for
its setup instructions, environment variables, scripts, and
implementation details.

## Running a Project

Each assignment may have different dependencies, scripts, and
configuration requirements. In general:

1.  Open the folder for the project you want to run.
2.  Read that folder's README and inspect its `package.json`.
3.  Install its dependencies with `npm install`.
4.  Configure the required environment variables in a local `.env` file,
    using the project's example configuration if provided.
5.  Run the script defined in that project's `package.json`.

**Security note:** Never commit API keys, database credentials, access
tokens, or other secrets to GitHub. Keep them in local environment
variables and provide only placeholder values in example configuration
files.

## Acknowledgements

Thanks to **FlyRank.ai** for providing the internship track and
practical assignments. This experience helped me connect backend
development fundamentals with authentication, databases, AI API
integration, testing, and document generation.

------------------------------------------------------------------------

*This README summarizes my internship learning journey. Project-specific
implementation details and the final capstone review status may be
updated as needed.*
