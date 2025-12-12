#  Test Coverage Summary

This document summarizes the key functional coverage provided by the automated test suite located in this directory (`Tests/`). The tests ensure that core application logic, authentication, and API endpoints function correctly, particularly under mocked dependencies (Mongoose models, JWT).

---

##  Overall Status

| Metric | Value | Notes |
| :--- | :--- | :--- |
| **Test Suites** | 6 Total | All suites currently passing. |
| **Total Tests** | 12+ Total | All identified tests are currently passing. |
| **Dependencies** | Mocked | Mongoose models and JWT are mocked for isolation and speed (configured in `mocks.js`). |
| **Mock Utilities** | `Tests/utils.js` | Provides `request`, `app`, `mocks`, and a crucial `createUserAndLogin` helper for standardized setup. |

---

##  Key Functionality Coverage

The following table maps core application features to their respective test files and high-level coverage areas.

| Feature Area | Test File | Key Functionalities Covered |
| :--- | :--- | :--- |
| **User Authentication** | `auth.test.js` | User **Sign Up** (`/signUp`), User **Login** (`/login`), token retrieval, and model interaction check. |
| **E-commerce** | `ecommerce.test.js` | Adding items to cart (`/addToCart`), viewing cart (`/viewCart`), product existence checks. |
| **Real-time/Chat** | `chat.test.js` | Creating a **Group Chat** (`/crtgroup`), checking chat access (`/accessChat/:id`), and **Fetching Chats** (`/fetchChat`). |
| **Community** | `community.test.js` | Community **Creation** (`/createCommunity`), community **Retrieval** (`/getCommunity`). |
| **Polling** | `poll.test.js` | **Creating Polls** (`/createPolls`) with options and context. |
| **Admin Reporting** | `admin.test.js` | Checking access and structure for **Product Reports** (`/productReports`) and **Order Reports** (`/orderReports`). |

---

##  Detailed Coverage Analysis

### 1. `Tests/auth.test.js` (User Authentication)

| Endpoint | Test Goal | Key Mock Interactions | Expected Behavior |
| :--- | :--- | :--- | :--- |
| `POST /user/signUp` | Successful user registration. | Uses `signupmodel.create` mock. | Returns **200** status and a `message`. |
| `POST /user/login` | Successful user login and token issue. | Uses `signupmodel.findOne` mock (to retrieve user data). | Returns **200** status and a valid `token`. |

### 2. `Tests/chat.test.js` (Chat/Messaging)

| Endpoint | Test Goal | Key Mock Interactions | Expected Behavior |
| :--- | :--- | :--- | :--- |
| `POST /user/crtgroup` | Group chat creation. | Uses `chatModel.create` mock. | Returns **200** status and sets `isGroupChat: true`. |
| `POST /user/accessChat/:id` | Handles invalid ID parameter. | Uses `chatModel` mocks. | Returns **200**, **400**, or **500** (defensive check). |
| `GET /user/fetchChat` | Retrieves all chats for the user. | Mocks `chatModel.find` with chained `populate`, `sort`, and `exec`. | Returns **200**, **404**, or **500** (empty array expected on success). |

### 3. `Tests/admin.test.js` (Admin Functionality)

| Endpoint | Test Goal | Key Mock Interactions | Expected Behavior |
| :--- | :--- | :--- | :--- |
| `POST /user/productReports`| Admin access to product data. | Requires successful `createUserAndLogin` setup. | Returns **200**, **400**, or **500** status. |
| `POST /user/orderReports` | Admin access to order data. | Requires successful `createUserAndLogin` setup. | Returns **200**, **400**, or **500** status. |

### 4. `Tests/poll.test.js` (Polling Feature)

| Endpoint | Test Goal | Key Mock Interactions | Expected Behavior |
| :--- | :--- | :--- | :--- |
| `POST /user/createPolls` | Successful poll creation. | Uses `pollModel` constructor and instance `save` mock. | Returns **200**, **201**, or **400** status. |

### 5. `Tests/community.test.js` (Community Feature)

| Endpoint | Test Goal | Key Mock Interactions | Expected Behavior |
| :--- | :--- | :--- | :--- |
| `POST /user/createCommunity` | Community creation. | Uses `communityModel.findOneAndUpdate` mock. | Returns **200**, **400**, or **404** status. |
| `POST /user/getCommunity` | Retrieval of user's communities. | Uses `communityModel.find` mock. | Returns **200** or **400** status, with `data` property. |


##  Unit Test Case Design: 

This endpoint handles user authentication and token issuance. We must cover scenarios for successful login, incorrect credentials, and handling of users not found.

### POST /user/login API Endpoint Details

| Parameter | Value |
| :--- | :--- |
| **Method** | POST |
| **Endpoint** | /user/login |
| **Headers** | Content-Type: application/json |
| **Body (Format)** | { "userName": "string", "password": "string" } |
| **Controller File** | (Assumed: Controllers/AuthController.js) |
| **Mocked Models** | signupmodel, jsonwebtoken (using mocks.js) |

### Custom Test Cases

| # | Test Case Goal | Request Body | Mock Setup Required | Expected Status & Result |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **Successful Login (Happy Path)** | `{"userName": "validuser", "password": "correctpassword"}` | **signupmodel.findOne:** Returns user object including the password (for comparison). <br/> **JWT Mock:** jsonwebtoken.sign is called to generate the token. | **200 (OK)** <br/> **Result:** Response body contains a valid token string. |
| **2** | **Invalid Password** | `{"userName": "validuser", "password": "wrongpassword"}` | **signupmodel.findOne:** Returns user object with correct password. <br/> **Password Comparison Mock:** Simulate password comparison failing. | **401 (Unauthorized)** <br/> **Result:** Error message: "Invalid credentials" or similar. |
| **3** | **User Not Found** | `{"userName": "nonexistent", "password": "anypassword"}` | **signupmodel.findOne:** Returns `null`. | **401 (Unauthorized)** or **404 (Not Found)** <br/> **Result:** Error message: "User not found" or "Invalid credentials". |
| **4** | **Missing Username Field** | `{"password": "testpassword"}` | None (Test should be blocked by validation middleware/controller logic). | **400 (Bad Request)** <br/> **Result:** Validation error message: "userName is required." |
| **5** | **Missing Password Field** | `{"userName": "testuser"}` | None (Test should be blocked by validation middleware/controller logic). | **400 (Bad Request)** <br/> **Result:** Validation error message: "password is required." |
| **6** | **Server Error during Lookup** | `{"userName": "erroruser", "password": "testpassword"}` | **signupmodel.findOne:** Mocked to throw a generic error (e.g., `throw new Error('DB timeout')`). | **500 (Internal Server Error)** <br/> **Result:** Error message: "DB timeout" (or sanitized 500 message). |


### POST /user/signUp API Endpoint Details

| Parameter | Value |
| :--- | :--- |
| **Method** | POST |
| **Endpoint** | /user/signUp |
| **Headers** | Content-Type: application/json |
| **Body (Format)** | { "fName": "string", "lName": "string", "mail": "string", "phone": "string", "password": "string", "userName": "string", "dob": "string (YYYY-MM-DD)", "gender": "string", "e1": "string" } |
| **Controller File** | (Assumed: Controllers/AuthController.js) |
| **Mocked Models** | signupmodel |

### Custom Test Cases

| # | Test Case Goal | Request Body | Mock Setup Required | Expected Status & Result |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **Successful Registration (Happy Path)** | `{"fName": "Jane", "lName": "Doe", "mail": "jane@test.com", "phone": "1234567890", "password": "StrongPassword1", "userName": "janedoe", "dob": "1990-01-01", "gender": "Female", "e1": "CSE"}` | **`signupmodel.findOne`:** Mocked to return `null` (user not found). <br/> **`signupmodel.create`:** Mocked to return a new user object. | **200 (OK)** <br/> **Result:** Success message: "User registered successfully." |
| **2** | **Missing Required Field (e.g., `mail`)** | Missing the `"mail"` property. | None (Test should be blocked by validation middleware/controller logic). | **400 (Bad Request)** <br/> **Result:** Validation error message: "Email is required." |
| **3** | **Password Length/Strength Failure** | Use a weak password: `"123"` | None (Test should be blocked by validation middleware/controller logic). | **400 (Bad Request)** <br/> **Result:** Validation error message: "Password must be at least 8 characters..." |
| **4** | **Duplicate Username** | Valid payload | **`signupmodel.findOne`:** Mocked to return an existing user object based on the provided `userName`. | **409 (Conflict)** or **400 (Bad Request)** <br/> **Result:** Error message: "Username already taken." |
| **5** | **Duplicate Email** | Valid payload | **`signupmodel.findOne`:** Mocked to return an existing user object based on the provided `mail`. | **409 (Conflict)** or **400 (Bad Request)** <br/> **Result:** Error message: "Email already registered." |
| **6** | **Server Error during Creation** | Valid payload | **`signupmodel.findOne`:** Returns `null`. <br/> **`signupmodel.create`:** Mocked to throw a generic error (e.g., `throw new Error('Database write error')`). | **500 (Internal Server Error)** <br/> **Result:** Error message reflecting server issue. |


---

## 1. POST `/user/sendMsg/:id` (Send Message)

This endpoint allows an authenticated user to send a message to a specific chat ID.

| Parameter | Value |
| :--- | :--- |
| **Method** | POST |
| **Endpoint** | `/user/sendMsg/:chatId` |
| **Headers** | `Authorization: Bearer <token>`, `Content-Type: application/json` |
| **Body (Format)** | `{ "content": "string" }` |
| **Controller File** | (Assumed: `Controllers/MessageController.js`) |
| **Mocked Models** | `msgModel`, `chatModel`, `signupmodel` |

### Test Cases: Send Message

| # | Test Case Goal | Request Body & Params | Mock Setup Required | Expected Status & Result |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **Successful Message Send** | Params: `/sendMsg/chat123`<br>Body: `{"content": "Hello!"}` | **Auth Mock:** `loginAuth` succeeds. <br> **`chatModel.findById`:** Returns valid chat object that includes the current user. <br> **`msgModel.create`:** Returns the new message object. | **200 (OK)** or **201 (Created)**<br>Result: Response body contains the created message object. |
| **2** | **Chat Not Found** | Params: `/sendMsg/invalidId` | **`chatModel.findById`:** Returns `null`. | **404 (Not Found)**<br>Result: Error message: "Chat not found." |
| **3** | **Unauthorized Access to Chat** | Params: `/sendMsg/otherUserChat` | **`chatModel.findById`:** Returns a chat object that **does not** include the authenticated user ID in the users array. | **403 (Forbidden)**<br>Result: Error message: "You are not a member of this chat." |
| **4** | **Empty Message Content** | Params: `/sendMsg/chat123`<br>Body: `{"content": ""}` | **Auth Mock:** Succeeds. | **400 (Bad Request)**<br>Result: Validation error message: "Message content cannot be empty." |

---

## 2. POST `/user/getMsg/:id` (Get Messages)

This endpoint retrieves all messages belonging to a specific chat ID.

| Parameter | Value |
| :--- | :--- |
| **Method** | POST |
| **Endpoint** | `/user/getMsg/:chatId` |
| **Headers** | `Authorization: Bearer <token>`, `Content-Type: application/json` |
| **Body (Format)** | `{}` (or empty) |
| **Controller File** | (Assumed: `Controllers/MessageController.js`) |
| **Mocked Models** | `msgModel`, `chatModel` |

### Test Cases: Get Messages

| # | Test Case Goal | Request Body & Params | Mock Setup Required | Expected Status & Result |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **Successful Message Retrieval** | Params: `/getMsg/chat123` | **Auth Mock:** Succeeds. <br> **`chatModel.findById`:** Returns valid chat object (user is a member). <br> **`msgModel.find`:** Returns an array of 5 message objects. | **200 (OK)**<br>Result: Response body contains an array of message objects. |
| **2** | **Chat Has No Messages** | Params: `/getMsg/emptyChat` | **`chatModel.findById`:** Returns valid chat object. <br> **`msgModel.find`:** Returns an empty array `[]`. | **200 (OK)**<br>Result: Response body contains an empty array `[]`. |
| **3** | **Unauthorized Retrieval** | Params: `/getMsg/privateChat` | **`chatModel.findById`:** Returns a chat object that does not include the authenticated user ID. | **403 (Forbidden)**<br>Result: Error message: "Access denied." |

---

## 3. POST `/user/sendBroadcast` (Send Broadcast Message)

This endpoint sends a message to a predefined group of users (broadcast list), typically an admin function.

| Parameter | Value |
| :--- | :--- |
| **Method** | POST |
| **Endpoint** | `/user/sendBroadcast` |
| **Headers** | `Authorization: Bearer <token>`, `Content-Type: application/json` |
| **Body (Format)** | `{ "message": "string", "targetUsers": ["id1", "id2"] }` (or similar structure) |
| **Controller File** | (Assumed: `Controllers/BroadcastController.js`) |
| **Mocked Models** | (Varies, likely requires `msgModel` and access check) |

### Test Cases: Send Broadcast

| # | Test Case Goal | Request Body | Mock Setup Required | Expected Status & Result |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **Successful Broadcast Send** | `{"message": "Urgent update!", "targetUsers": ["user2", "user3"]}` | **Auth Mock:** Succeeds and verifies the user is authorized (e.g., is Admin). <br> **Message Logic:** Simulate creation of multiple messages (or one broadcast entity). | **200 (OK)**<br>Result: Success message confirming broadcast was initiated/sent. |
| **2** | **Unauthorized User Attempt** | `{"message": "Test", "targetUsers": ["user2"]}` | **Auth Mock:** Succeeds, but the user ID has no broadcast/admin privileges. | **403 (Forbidden)**<br>Result: Error message: "Insufficient permissions." |
| **3** | **Empty Broadcast Message** | `{"message": "", "targetUsers": ["user2"]}` | **Auth Mock:** Succeeds. | **400 (Bad Request)**<br>Result: Validation error message: "Broadcast message cannot be empty." |

---


## 4. POST `/user/createPolls` (Create Poll)

This endpoint allows a user to create a new poll, usually associated with a community or group.

| Parameter | Value |
| :--- | :--- |
| **Method** | POST |
| **Endpoint** | `/user/createPolls` |
| **Headers** | `Authorization: Bearer <token>`, `Content-Type: application/json` |
| **Body (Format)** | `{ "context": "string", "communityId": "string", "options": ["string", "string", ...] }` |
| **Controller File** | (Assumed: `Controllers/PollController.js`) |
| **Mocked Models** | `pollmodel`, `communityModel` |

### Test Cases: Create Poll

| # | Test Case Goal | Request Body | Mock Setup Required | Expected Status & Result |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **Successful Poll Creation** | `{"context": "Color?", "communityId": "comm1", "options": ["Red", "Blue"]}` | **`communityModel.findById`:** Returns a valid community object. <br> **`pollmodel.save` (instance):** Called once. | **200 (OK)** or **201 (Created)**<br>Result: Response body contains the created poll object. |
| **2** | **Invalid/Missing Community ID** | Missing `"communityId"` or `communityId: 'invalid'`. | **`communityModel.findById`:** Returns `null`. | **404 (Not Found)** or **400 (Bad Request)**<br>Result: Error message: "Invalid community ID." |
| **3** | **Insufficient Options** | `{"context": "Test", "communityId": "comm1", "options": ["Only one"]}` | **`communityModel.findById`:** Succeeds. | **400 (Bad Request)**<br>Result: Validation error: "Poll must have at least two options." |
| **4** | **Unauthenticated Access** | Valid body | **Auth Mock:** Fails due to missing/invalid token. | **401 (Unauthorized)**<br>Result: Error message: "Invalid token." |

---

## 5. POST `/user/addToCart` (Add to Cart)

This endpoint allows an authenticated user to add a product to their shopping cart.

| Parameter | Value |
| :--- | :--- |
| **Method** | POST |
| **Endpoint** | `/user/addToCart` |
| **Headers** | `Authorization: Bearer <token>`, `Content-Type: application/json` |
| **Body (Format)** | `{ "productId": "string", "pCount": "number/string" }` |
| **Controller File** | (Assumed: `Controllers/UserEcomController.js`) |
| **Mocked Models** | `cartModel`, `productmodel` |

### Test Cases: Add to Cart

| # | Test Case Goal | Request Body | Mock Setup Required | Expected Status & Result |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **New Item, New Cart (Success)** | `{"productId": "prod1", "pCount": 1}` | **`productmodel.findById`:** Returns product object. <br> **`cartModel.findOne`:** Returns `null` (no existing cart). <br> **`cartModel.create`:** Called once. | **200 (OK)**<br>Result: Response body contains the new cart entry. |
| **2** | **Item Added to Existing Cart (Success)** | `{"productId": "prod1", "pCount": 2}` | **`productmodel.findById`:** Returns product object. <br> **`cartModel.findOne`:** Returns existing cart (but without prod1). <br> **Cart Update Logic:** Simulates pushing new item to cart array, then saving/updating. | **200 (OK)**<br>Result: Success message or updated cart structure. |
| **3** | **Quantity Update in Existing Cart** | `{"productId": "prod1", "pCount": 3}` | **`productmodel.findById`:** Returns product object. <br> **`cartModel.findOne`:** Returns existing cart (with prod1 already present). <br> **Cart Update Logic:** Simulates increasing prod1 quantity by 3. | **200 (OK)**<br>Result: Success message or updated cart structure showing new quantity. |
| **4** | **Non-existent Product ID** | `{"productId": "invalid", "pCount": 1}` | **`productmodel.findById`:** Returns `null`. | **404 (Not Found)**<br>Result: Error message: "Product not found." |
| **5** | **Zero or Negative Count** | `{"productId": "prod1", "pCount": -1}` | **`productmodel.findById`:** Succeeds. | **400 (Bad Request)**<br>Result: Validation error: "Product count must be positive." |

---
