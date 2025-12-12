#  1. EngiVerse Platform Backend Documentation

## 1.1 Overview

EngiVerse is a combined **networking and e-commerce platform** specifically designed for engineers.

The primary role of the backend system is to provide robust functionality to support all platform features.

---

## 1.2 Key Backend Functionality

The backend is responsible for managing and driving the following core features:

* **User Authentication:** A secure flow covering:
    * OTP-based verification
    * User signup
    * User login
* **Communication:** Management of both:
    * Personal (1:1) chat system
    * Group chat system
* **Community & Events:**
    * Management of dedicated **Engineering Communities**
    * Broadcasting and updates for **Hackathons**
* **Engagement:**
    * Creation of **Polls**
    * Handling user **Voting**
* **E-commerce:**
    * Product browsing and search
    * Shopping **Cart** management
* **Administration:**
    * Generation of **Admin Analytics**
    * Creating system **Reports**

---

## 1.3 Backend Stack

The EngiVerse backend is built using a modern, scalable JavaScript-based stack:

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Runtime Environment** | **Node.js** | Server-side JavaScript execution |
| **Web Framework** | **Express.js** | Fast, unopinionated, minimalist web framework |
| **Database** | **MongoDB** | NoSQL database for flexible data structure |
| **ODM (Object Data Modeling)** | **Mongoose** | Provides structure and validation layer for MongoDB |
| **Authentication** | **JWT (JSON Web Tokens)** | Secure, state-less user authentication |
| **Architecture** | **Middleware-Driven** | Modular architecture utilizing middleware functions for request handling, security, and logging |

#  2. EngiVerseServer Directory Structure

This structure outlines the organization of the **EngiVerseServer** backend, following a modular pattern focused on Controllers, Middleware, and Models.

## Core Folders

### 2.1 Controllers

This directory houses the logic for handling requests, processing data, and interacting with the Models.

| File | Purpose | Related Features |
| :--- | :--- | :--- |
| `AdminController.js` | Core logic for general administrative tasks. | Admin Analytics, Reporting |
| `chatAdmin.js` | Administrative controls specific to the chat system. | Personal & Group Chat |
| `ecomAdmin.js` | Administrative controls specific to e-commerce (e.g., product management). | E-commerce |
| `chatController.js` | Logic for handling personal and group chat messages. | Personal & Group Chat |
| `communityController.js` | Logic for managing engineering communities. | Engineering Communities |
| `msgController.js` | Handles message-related operations. | Chat System |
| `pollController.js` | Logic for creating and managing polls and votes. | Poll Creation and Voting |
| `UserController.js` | Core logic for user-related actions (e.g., profile). | User Authentication |
| `UserEcomController.js` | Logic for user interaction with the e-commerce system (e.g., browsing, cart). | E-commerce |

---

### 2.2 Middleweres (Middleware)

These files contain functions that execute before the Controllers to handle validation, authentication, and pre-processing tasks.

* `loginMiddleware.js`: Logic to validate and authenticate user login requests (likely using JWT).
* `signUpMiddleware.js`: Logic to validate user input during the sign-up process.

---

### 2.3 Models

These files define the schema and structure of the data used in the MongoDB database via Mongoose.

| File | Purpose | Related Features |
| :--- | :--- | :--- |
| `broadcastModel.js` | Schema for broadcast messages (e.g., hackathon broadcasts). | Hackathon Broadcasts |
| `cartModel.js` | Schema for storing user shopping cart data. | E-commerce Cart |
| `chatModel.js` | Schema for managing chat room/group data. | Personal & Group Chat |
| `communityModel.js` | Schema for defining and storing community data. | Engineering Communities |
| `hackathonModel.js` | Schema for storing hackathon event details. | Hackathon Broadcasts |
| `imageModel.js` | Schema for managing uploaded images (e.g., product images, profile pics). | Various |
| `loginModel.js` | Schema related to login data/records. | User Authentication |
| `msgModel.js` | Schema for storing individual chat messages. | Chat System |
| `otpModel.js` | Schema for storing and validating One-Time Passwords. | User Authentication (OTP) |
| `polsModel.js` | **(Likely `pollsModel.js`)** Schema for poll definitions. | Poll Creation and Voting |
| `productModel.js` | Schema for storing e-commerce product details. | E-commerce |
| `productReportModel.js` | Schema for storing admin reports related to products/e-commerce. | Admin Reporting |
| `signupModel.js` | Schema for storing user signup data. | User Authentication |
| `tempNumStoring.js` | **(Likely `tempNumStoringModel.js`)** Schema for temporary storage, possibly during OTP flow. | User Authentication |

---

### 2.4 Routers

These files define the API endpoints and map them to the corresponding Controller functions.

* `Admin.js`: Defines all API routes accessible by administrative users.
* `User.js`: Defines all API routes accessible by regular platform users.

---


# 3.  Authentication Flow

The EngiVerse platform utilizes a secure, multi-step authentication process, beginning with an OTP request and culminating in JWT-based authorization.

## 3.1. OTP Generation

This is the initial step for user verification and registration.

* **Endpoint:** `/user/otp` (POST)
* **Process:**
    * The user requests an OTP using their phone number.
    * **Crucial Validation:** If the phone number already exists in the system, the request is **blocked** (preventing multiple accounts with the same number).
    * The generated OTP is saved in the **`otpModel`** for later verification.

## 3.2. OTP Verification

This step confirms the user's identity before proceeding to full sign-up.

* **Endpoint:** `/user/verify` (POST)
* **Process:**
    * The system checks the provided OTP against the one stored in the `otpModel`.
    * **If valid:**
        1.  A temporary entry for the verified number is created in the **`tempNumStoring.js`** model (`tempNumModel`).
        2.  The previous OTP records are deleted.
        3.  A **JWT token** is returned to the client, allowing them to proceed to the final sign-up step.

## 3.3. Signup

The final registration step, executed after successful OTP verification.

* **Middleware:** Uses the **`signupAuth`** middleware (defined in `signUpMiddleware.js`) for authorization and validation.
* **Process:**
    1.  A new user entry is created and saved in the **`signupModel`**.
    2.  The new user is automatically added to:
        * Their selected **Engineering Community**.
        * The **General Chat Room** associated with that community.

## 3.4. Login

Handles existing user access to the platform.

* **Process:**
    1.  The system verifies the user's provided credentials (e.g., phone number/password).
    2.  Upon successful verification, the backend returns a new **JWT token** along with the complete **user details**.

## 3.5. JWT Middleware

The core mechanism for protecting authenticated routes throughout the API.

* **Middleware Name:** **`loginAuth`** (defined in `loginMiddleware.js`).
* **Process:**
    1.  **Token Extraction:** Extracts the token from the request header in the format: `Authorization: Bearer <token>`.
    2.  **Verification:** Verifies the extracted token using the secure secret key stored in the environment variables (**`process.env.Skey`**).
    3.  **Request Attachment:** If verification is successful, the decoded user payload is attached to the request object as **`req.login`**, allowing the controller logic to access the authenticated user's ID and details.


## 4.  Controller Function Documentation

This section details the primary functions within the backend controllers, grouped by their respective files and domains.

---

### 4.1. AdminController

This controller handles core administrative tasks, reporting, and high-level data access.

| Function | Description | Access | Request Body | Response Body (Success) |
| :--- | :--- | :--- | :--- | :--- |
| **`adminLogin`** | Handles administrative user login using hardcoded credentials. **(Note: Hardcoded credentials are used - `admin123` / `1234`)** | Public | `userName`, `password` | `{ message: "User Found" }` (Status 200) |
| **`commLoop`** | Retrieves a list of all engineering communities and populates the `users` field to show members. | Admin | None | `{ message: "Successphool", data: [Community & User Data] }` |
| **`productReports`** | Retrieves all product data from the database, likely for inventory or sales reporting. | Admin | None | `{ message: "Success", data: [Product Data] }` |
| **`orderReports`** | Retrieves all shopping cart data, which serves as a record of user orders/checkouts. | Admin | None | `{ message: "Success", data: [Cart Data] }` |

---

### 4.2. ChatAdmin (Hackathon Management)

This small controller is dedicated to administrative tasks related to hackathon broadcasts.

| Function | Description | Access | Request Body | Response Body (Success) |
| :--- | :--- | :--- | :--- | :--- |
| **`adminHackathon`**| Creates and saves a new hackathon broadcast entry in the `hackathonModel`. | Admin | `hackathonName`, `hackathonUrl`, `hackathonContext`, `hackathonDate`, `hackathonMode` | `{ message: "Hackathon Added" }` (Status 200) |

---

### 4.3. EcomAdmin

Functions for administrative management of the e-commerce product catalog.

| Function | Description | Access | Request Body | Response Body (Success) |
| :--- | :--- | :--- | :--- | :--- |
| **`productAdd`** | Adds a new product to the e-commerce catalog. Includes fields for naming, pricing, and stock. | Admin | `pName`, `pPrice`, `pDesc`, `pquant`, `pCat` | `{ message: "Product Added" }` |
| **`productShow`** | Retrieves a list of all products in the e-commerce catalog. | Admin | None | `{ message: "Successphool", data: [Product List] }` |
| **`productFullDesc`**| Retrieves the detailed information for a single product by its ID. | Admin | `id` (Product ID) | `{ message: "Productss!!!", temp: {Product Data} }` (Status 200) |

---

### 4.4. ChatController

Handles personal (1:1) and group chat functionality.

| Function | Description | Access | Request Params | Request Body | Response Body (Success) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`accessChat`** | Initializes a 1:1 chat with another user. Finds an existing chat or creates a new one if none exists. | User (Auth Required) | `id` (Target User ID) | None | Existing or Newly Created Chat Object (Status 200) |
| **`fetchChats`** | Retrieves all 1:1 and group chats the authenticated user belongs to, sorted by latest message. | User (Auth Required) | None | None | Array of populated Chat Objects (Status 200) |
| **`crtGroupChat`** | Creates a new group chat with specified users. The authenticated user is automatically set as the group admin. | User (Auth Required) | None | `userIds` (Array), `chatName`, `chatDesc`, `chatType` | Full Chat Object (Status 200) |
| **`leaveGrp`** | Allows the authenticated user to leave a specified group chat. | User (Auth Required) | `id` (Chat ID) | None | Updated Chat Object (Status 200) |
| **`joinGrp`** | Allows the authenticated user to join a group chat. Includes a check to prevent duplicate joins. | User (Auth Required) | `id` (Chat ID) | None | Updated Chat Object (Status 200) |
| **`getGrp`** | Retrieves all group chats that the authenticated user is a member of. | User (Auth Required) | None | None | Array of Group Chat Objects (Status 200) |

---

### 4.5. CommunityController

Manages the creation, listing, and interaction with engineering communities and broadcast features.

| Function | Description | Access | Request Params | Request Body | Response Body (Success) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`getHackathon`** | Retrieves a list of all active hackathon broadcasts. | User (Auth Required) | None | None | `{ message: "Hackathon added Successfull", data: [Hackathon Data] }` |
| **`createCommunity`** | Creates a new engineering community and automatically sets up its corresponding general chat room. | Public (Admin/Special Role Implied) | None | `communityName`, `introduction`, `descr` | `{ data: {Community Data}, status: 200, message: "Created" }` |
| **`getCommuntities`**| Retrieves a list of all created engineering communities. | Public | None | None | `{ data: [Community Data], status: 200, message: "Created" }` |
| **`sendBroadcast`** | Allows a user (likely Admin/Moderator) to post a broadcast message to a community. | User (Auth Required) | None | `context`, `require`, `finance` (Optional) | `{ message: "Broadcast succesfull" }` (Status 200) |
| **`getBroadcast`** | Retrieves all broadcast messages, populating the `user` field for sender details. | User (Auth Required) | None | None | `{ message: "Broadcassst succussfully shown", data: [Broadcast Data] }` |
| **`joinComunity`** | Allows the authenticated user to join a specified community. | User (Auth Required) | `id` (Community ID) | None | Updated Community Object (Status 200) |
| **`leaveComm`** | Allows the authenticated user to leave a specified community. | User (Auth Required) | `id` (Community ID) | None | Updated Community Object (Status 200) |

---

### 4.6. MsgController

Handles the sending and retrieval of individual messages within chats.

| Function | Description | Access | Request Params | Request Body | Response Body (Success) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`messageSendBody`** | Sends a new message to a specific chat (1:1 or group). Updates the chat's `latestMessage` field. | User (Auth Required) | `id` (Chat ID) | `content` (Message text) | `{ message: "OK", data: {Message Data} }` (Status 200) |
| **`messageGetBody`** | Retrieves all messages for a given chat ID. Populates sender details and adds a `status` flag (`true` if sent by the authenticated user). | User (Auth Required) | `id` (Chat ID) | None | Array of Populated Message Objects |

---

### 4.7. PollController

Functions for creating, voting, and retrieving user-generated polls within communities.

| Function | Description | Access | Request Params | Request Body | Response Body (Success) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`createPolls`** | Creates a new poll with context, options, and an associated community ID. | User (Auth Required) | None | `context`, `communityId`, `options` (Array of strings) | `{ message: 'Poll created successfully', poll: {New Poll Data} }` (Status 201) |
| **`pollVote`** | Handles voting (or unvoting) on a poll. Ensures a user can only select one option at a time (toggles vote). | User (Auth Required) | `pId` (Poll ID), `oId` (Option ID) | None | `{ message: 'Vote added/removed successfully', poll: {Updated Poll Data} }` (Status 200) |
| **`getAllPolls`** | Retrieves all polls for a specific community, populating the vote counts and user details. | User (Auth Required) | `id` (Community ID) | None | `{ message: 'Polls Retrived Successfully', poll: [Poll Data] }` (Status 200) |
| **`getMyPolls`** | Retrieves only the polls created by the authenticated user within a specific community. | User (Auth Required) | `id` (Community ID) | None | `{ message: 'Polls Retrived Successfully', poll: [Poll Data] }` (Status 200) |

---

### 4.8. UserController

Handles user-facing authentication (Login, OTP flow) and profile/community data retrieval.

| Function | Description | Access | Request Params | Request Body | Response Body (Success) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`Login`** | Handles user login using `userName` and `password`. Returns JWT token and user details on success. | Public | None | `userName`, `password` | `{ message: "User Found", ..., token: JWT }` (Status 200) |
| **`showEtype`** | Retrieves all communities the authenticated user is a member of. | User (Auth Required) | None | None | `{ orgy: [Community Data] }` (Status 200) |
| **`otp`** | Generates a 4-digit OTP and saves it in `otpmodel`. Blocks request if the phone number is already signed up. | Public | None | `phone` | `Mahesh DalleXXXX` (where XXXX is the OTP) |
| **`verifyOtp`** | Validates the provided OTP. On success, creates a temporary model entry (`tempNumModel`) and deletes all previous OTPs for that number. | Public | None | `phone`, `otp` | `{ message: "Verified", token: JWT }` (Status 200) |
| **`signUp`** | Registers a new user after OTP verification. Automatically adds the user to their selected `engineerType` community and its general chat. | Public | None | `fName`, `mail`, `lName`, `phone`, `password`, `userName`, `dob`, `gender`, `e1` (Engineer Type) | `{ message: "Sign Up Done!!" }` |
| **`changDp`** | Updates the authenticated user's profile picture ID/URL. | User (Auth Required) | `id` (New DP ID/URL) | None | `{ data: {Updated User Data} }` (Status 200) |

---

### 4.9. UserEcomController

Handles all user interactions with the e-commerce functionality (browsing, searching, cart).

| Function | Description | Access | Request Params | Request Body | Response Body (Success) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`searchBar`** | Searches for a product by its name. | Public | None | `searchBody` (Product Name) | `{ data: {Product Data}, message: "Found" }` (Status 200) |
| **`catFilter`** | Retrieves a product based on its category. (Note: Current implementation seems to find only one result). | Public | None | `productCat` | `{ message: "jsk", data: {Product Data}, status: 200 }` |
| **`singleProductDetail`** | Retrieves detailed information for a single product by its ID. | Public | `id` (Product ID) | None | `{ message: "Displayed", data: {Product Data} }` |
| **`addToCart`** | Adds a product to the authenticated user's shopping cart. Creates a new cart or updates an existing one. | User (Auth Required) | None | `id` (Product ID), `pName`, `pCount` (Optional) | `{ message: "Product added to cart successfully", cart: {Cart Data} }` |
| **`viewCart`** | Retrieves the contents of the authenticated user's shopping cart, populated with product details. | User (Auth Required) | None | None | `{ data: {Cart Data} }` (Status 200) |
| **`checkOut`** | Placeholder for the checkout process (currently retrieves all product data). | User (Auth Required) | None | None | `{ data: [Product Data] }` (Status 200) |

---
---

## 5.  API Endpoints and Routing

This section documents all available API endpoints, grouped by their respective router files, detailing the HTTP method, route path, and the controller function responsible for handling the request.

---

### 5.1. Admin Routes (`/api/admin/...`)

These routes are used for administrative functionality, primarily for system management, analytics, and content addition (products, hackathons, communities).

| HTTP Method | Route Path | Controller Function | Description | Access |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/product` | `productAdd` | Adds a new product to the e-commerce catalog. | Admin |
| **POST** | `/productShow` | `productShow` | Retrieves a list of all products in the catalog. | Admin |
| **POST** | `/addHackathon` | `adminHackathon` | Adds a new hackathon event/broadcast. | Admin |
| **POST** | `/adminLogin` | `adminLogin` | Logs in the administrator. | Public |
| **POST** | `/commLoop` | `commLoop` | Retrieves list of all communities with populated user details (for reporting). | Admin |
| **POST** | `/productDesc` | `productFullDesc` | Retrieves the detailed description for a single product. | Admin |
| **POST** | `/addCommunity` | `createCommunity` | Creates a new engineering community (General/Admin use). | Admin/General |
| **POST** | `/productReports` | `productReports` | Retrieves all product data for reporting purposes. | Admin |
| **POST** | `/orderReports` | `orderReports` | Retrieves all cart/order data for reporting purposes. | Admin |

---

### 5.2. User Routes (`/api/user/...` or `/...` depending on setup)

These routes handle all general user interactions, including authentication, chat, community engagement, polling, and e-commerce.

| HTTP Method | Route Path | Controller Function | Description | Access | Middleware |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **POST** | `/otp` | `otp` | Generates and sends an OTP to a phone number. | Public | None |
| **POST** | `/verify` | `verifyOtp` | Validates the OTP and returns a JWT token for the final sign-up step. | Public | None |
| **POST** | `/signUp` | `signUp` | Completes the user registration process. | Public | `signupAuth` |
| **POST** | `/login` | `Login` | Logs in an existing user and returns a JWT token. | Public | None |
| **GET** | `/profile` | `zinSakai` | Simple test route to verify token validity and access. | Private | `loginAuth` |
| **POST** | `/search` | `searchBar` | Searches the product catalog by name. | Public | None |
| **POST** | `/catFilter` | `catFilter` | Filters products by category. | Public | None |
| **POST** | `/productDesc` | `singleProductDetail` | Retrieves single product details. | Public | None |
| **POST** | `/addToCart` | `addToCart` | Adds a product to the user's shopping cart. | Private | JWT Auth |
| **POST** | `/viewCart` | `viewCart` | Retrieves the contents of the authenticated user's cart. | Private | JWT Auth |
| **POST** | `/checkOut` | `checkOut` | Initiates the checkout process (currently placeholder for product listing). | Private | JWT Auth |
| **POST** | `/accessChat/:id` | `accessChat` | Initializes or retrieves a 1:1 chat with another user. | Private | JWT Auth |
| **GET** | `/fetchChat` | `fetchChats` | Retrieves all chats for the authenticated user. | Private | JWT Auth |
| **POST** | `/crtgroup` | `crtGroupChat` | Creates a new group chat. | Private | JWT Auth |
| **POST** | `/sendMsg/:id` | `messageSendBody` | Sends a message to a specific chat ID. | Private | JWT Auth |
| **POST** | `/getMsg/:id` | `messageGetBody` | Retrieves all messages for a specific chat ID. | Private | JWT Auth |
| **POST** | `/getHackathon` | `getHackathon` | Retrieves a list of all hackathon broadcasts. | Private | JWT Auth |
| **POST** | `/sendBroadcast` | `sendBroadcast` | Posts a broadcast message to a community. | Private | JWT Auth |
| **POST** | `/getBroadcast` | `getBroadcast` | Retrieves all broadcast messages. | Private | JWT Auth |
| **POST** | `/leaveGrp` | `leaveGrp` | Allows the user to leave a group chat. | Private | JWT Auth |
| **POST** | `/showGrp` | `getGrp` | Retrieves all group chats the user belongs to. | Private | JWT Auth |
| **POST** | `/createPolls` | `createPolls` | Creates a new community poll. | Private | JWT Auth |
| **POST** | `/pollVote/:pId/:oId` | `pollVote` | Adds or removes a vote on a poll option. | Private | JWT Auth |
| **GET** | `/getAllPolls/:id` | `getAllPolls` | Retrieves all polls for a given community ID. | Private | JWT Auth |
| **GET** | `/getMyPolls/:id` | `getMyPolls` | Retrieves polls created by the authenticated user in a community. | Private | JWT Auth |
| **POST** | `/changDp/:id` | `changDp` | Updates the user's profile picture. | Private | JWT Auth |
| **POST** | `/getDp` | `getDp` | Placeholder for retrieving profile picture details. | Private | JWT Auth |
| **POST** | `/joinComunity/:id` | `joinComunity` | Allows the user to join a community by ID. | Private | JWT Auth |
| **POST** | `/getCommunity` | `getCommuntities` | Retrieves a list of all available communities. | Public | None |
| **POST** | `/showEtype` | `showEtype` | Retrieves communities the user is a member of. | Private | JWT Auth |
| **POST** | `/getOneCummunity/:id` | `showEtype` | **(Duplicates functionality of `showEtype`)** Retrieves communities the user is a member of. | Private | JWT Auth |
| **POST** | `/leaveComm/:id` | `leaveComm` | Allows the user to leave a community by ID. | Private | JWT Auth |
| **POST** | `/getGeneralChat/:id` | `getGeneralChat` | Retrieves the general chat for a given community. | Private | JWT Auth |

## 6. 📈 Design Improvement and Refactoring

This section outlines the architectural improvements made to the EngiVerse backend, focusing on applying core software design principles to enhance maintainability, scalability, and clarity.

---

## 6.1. How the Software Design Was Improved

The primary design improvements came from strict separation of concerns and eliminating hidden dependencies, moving away from a monolithic prototype-style structure.

### 1. Decoupling Logic (Router → Controller → Model)

**Before:**  
Business logic risked leaking into routers or being mixed across controllers.

**After (Current Design):**  
A clean, layered flow is enforced:

- **Router** → defines paths and HTTP methods  
- **Middleware** → handles cross-cutting concerns (authentication, validation)  
- **Controller** → contains business logic  
- **Model** → manages data structure and integrity  

**Improvement:**  
A structured flow enables easier debugging and allows controllers to be unit-tested independently of routing.

---

### 2. Enhanced Authorization and Security

**Before:**  
JWT authorization was sometimes inconsistent or handled inline within routes.

**After:**  
Reusable middleware (`loginAuth`, `signupAuth`) ensures consistent authorization across all protected endpoints.

**Impact:**  
Prevents security gaps and ensures authorization logic is centralized and uniform.

---

### 3. Data Integrity via Schema Relations

**Before:**  
Data relationships relied on manual ID management.

**After:**  
Extensive use of **Mongoose `ref` relations** ensures accurate linking across models.

Examples:

- **Chat:** `chatModel.users` → references `signupmodel`  
- **Community:** `communityModel.genralChat` → references `chatModel`  
- **E-commerce:** `cartModel.product` → references `productmodel`

**Impact:**  
Enforces data consistency and reduces relational errors.

---

## 6.2. Application of Design Principles

The refactoring strongly applied modern software design principles:

### **Separation of Concerns (SoC)**  
- Applied in **Routers, Controllers, Middleware**  
- Led to distinct modules: `AdminController`, `UserController`, `UserEcomController`, etc.  
- Ensures e-commerce logic never mixes with chat logic, etc.

### **Single Responsibility Principle (SRP)**  
- Applied to **controller functions**  
- Each function handles exactly one purpose  
  - Example: `pollVote` → only toggles a vote; does not fetch or create polls.

### **Don’t Repeat Yourself (DRY)**  
- Applied to **authorization logic**  
- JWT validation moved to reusable middleware (`loginAuth`, `signupAuth`)  
- Eliminated repeated code across dozens of routes.

### **Dependency Inversion Principle (DIP)**  
- Controllers depend on **Mongoose model interfaces**, not database internals.  
- Makes system easier to change (e.g., swapping ORM).

---

## 6.3. Key Refactoring Done to Improve Design

The improvements involved targeted restructuring, not just adding features.

---

### 1. Refactoring Authentication to a Two-Tier JWT System

**Problem:**  
Signup required phone number verification, but giving a full JWT before verification was insecure.

**Refactoring:**  
Introduced two-token architecture:

- **Temporary JWT** (`signupAuth`)  
  - Issued after OTP verification  
  - Only valid for `POST /user/signUp`  
  - Validates `tempNumModel`

- **Permanent JWT** (`loginAuth`)  
  - Issued after signup/login  
  - Valid for all protected routes  
  - Validates `signupmodel`

**Result:**  
A secure, controlled onboarding flow preventing unverified accounts.

---

### 2. Standardizing E-commerce Controller Structure

**Problem:**  
E-commerce logic was scattered across multiple files.

**Refactoring:**  

- Consolidated **user-facing** e-commerce operations into `UserEcomController`  
  - `searchBar`, `catFilter`, `addToCart`, `viewCart`, `checkOut`
- **Admin-facing** e-commerce logic remains in `EcomAdmin`  
  - `productAdd`, `productShow`

**Result:**  
Clear boundary between user transactional logic and admin catalog management.

---

### 3. Centralizing Chat and Community Access

**Problem:**  
Community general chat rooms were implemented separately from 1:1 chats.

**Refactoring:**  
Added a reference in `communityModel`:


genralChat: { type: Schema.Types.ObjectId, ref: 'chatModel' }

## 2. Design Patterns Used

These are proven, reusable solutions to common software design problems.

---

### **Factory Method Pattern**

**Type:** Creational  

**Description:**  
Provides an interface for creating objects in a superclass while allowing subclasses (or specialized functions) to determine the type of object created.

**Application in EngiVerse:**  
Used subtly in chat and cart creation flows.

- The `accessChat` controller behaves like a **factory**:
  - If a chat exists → it returns the existing instance  
  - If not → it **creates** a new Chat instance  

This follows the Factory Method principle by delegating object creation based on runtime conditions.

---

### **Observer Pattern**

**Type:** Behavioral  

**Description:**  
Defines a one-to-many relationship so that when one object changes state, its dependents are automatically notified.

**Application in EngiVerse:**  
The `latestMessage` field in `chatModel` functions as a lightweight observer.

- When a new `msgModel` is created  
- The message controller **updates** the parent chat with the new message ID  

This ensures that chat previews always display the most recent message.

---

### **Strategy Pattern**

**Type:** Behavioral  

**Description:**  
Defines a family of algorithms, encapsulates them separately, and allows them to be interchangeable.

**Application in EngiVerse:**  
Middleware functions serve as interchangeable **authorization strategies**:

- `loginAuth` → used for authenticated user access  
- `signupAuth` → used for temporary signup-token verification  

The routing layer stays identical, but the **authorization strategy** changes based on the endpoint.

---

