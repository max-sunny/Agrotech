Agri-Tech: Smart Farming Management Platform
Product Requirements Document (PRD) | Version 1.0 | Stack: MERN (MongoDB, Express.js, React.js, Node.js)
1. Product Overview
Agri-Tech is a full-stack, responsive, multilingual web application that gives farmers digital tools for modern farm management. It combines real-time weather forecasting, soil health analysis, pest alerts, resource purchasing, and expert consultation in one platform. Admins manage users, resources, orders, and community content.
The product bridges traditional farming practice and modern technology, so that farmers can make data-driven decisions, raise crop yield, and reduce losses.
2. Problem Statement
Farmers, especially smallholders, face several recurring problems:
• Unpredictable weather and no timely, localized forecasts
• Late detection of pests and crop diseases, leading to yield loss
• No simple way to assess soil health or know what inputs a crop needs
• Difficulty buying quality seeds, fertilizers, and tools and tracking those orders
• Limited access to agricultural experts and peer knowledge
• Existing digital tools are often English-only, complex, and unsuited to low-literacy users
3. Goals and Objectives
3.1 Product Goals
1. Provide one accessible platform covering the farm lifecycle: planning, monitoring, buying, and learning.
2. Deliver actionable insights (soil score, pest alerts, weather trends) rather than raw data.
3. Support regional languages and simple UX so that low-literacy users can use it.
4. Give admins full control over content, resources, and users.
3.2 Success Metrics
Metric
Target
Registration-to-first-farm completion rate
70% or higher
Weekly active farmers (of registered)
40% or higher
Average API response time
under 500 ms
Page load on 4G (initial)
under 3 s
Pest alerts viewed within 24 h of issue
60% or higher
Order placement success rate
95% or higher
Critical bugs at release
0
3.3 Non-Goals (Version 1)
• Native mobile apps (the web app is responsive instead)
• Real payment gateway integration (orders use a simulated or cash-on-delivery flow)
• Machine-learning crop disease detection from images
• IoT sensor integration
• Live video consultation
4. Target Users and Personas
Persona 1: Farmer (primary)
• Small to medium landholder, often with limited English and limited digital literacy
• Uses a smartphone on a mobile data connection
• Needs: weather, pest warnings, soil guidance, affordable inputs, expert advice
Persona 2: Admin (secondary)
• Platform operator or agri-extension officer
• Needs: manage users, approve and fulfill orders, maintain the product catalog, moderate forum content, view platform statistics
Persona 3: Agri Expert (optional role in v1, handled through forum replies)
• Answers farmer questions in the consultation section
5. User Roles and Permissions
Capability
Guest
Farmer
Admin
View landing page, browse store
Yes
Yes
Yes
Register and log in
Yes
n/a
n/a
Manage own farms and crops
No
Yes
View all
Soil analysis, weather, pest alerts
No
Yes
Yes
Place and track orders
No
Yes (own)
View all
Create forum posts and replies
No
Yes
Yes
Delete own posts
No
Yes
Yes
Moderate or delete any post
No
No
Yes
Manage resources (CRUD)
No
No
Yes
Approve or reject orders
No
No
Yes
Manage users, view statistics
No
No
Yes
6. Functional Requirements
Priority key: P0 = must have, P1 = should have, P2 = nice to have.
6.1 Module: Authentication and User Management
ID
Requirement
Priority
AUTH-1
User can register with name, email, password, phone, preferred language
P0
AUTH-2
Email must be unique; password minimum 8 characters
P0
AUTH-3
User can log in and receives a JWT with an expiry
P0
AUTH-4
Passwords are hashed with bcrypt (10 or more salt rounds)
P0
AUTH-5
Authenticated user can view and update their profile
P0
AUTH-6
Logout clears the token on the client
P0
AUTH-7
Role-based route protection on backend and frontend
P0
AUTH-8
Password change
P1
AUTH-9
Password reset by email
P2
6.2 Module: Farm Profile Management
ID
Requirement
Priority
FARM-1
Farmer can create a farm with name, location, area (acres), soil type, water source
P0
FARM-2
Farmer can view a list of their farms and each farm's details
P0
FARM-3
Farmer can edit and delete a farm (with confirmation)
P0
FARM-4
A farmer can access only their own farms
P0
FARM-5
Farm dashboard summarizing crops, latest soil score, and active alerts
P1
6.3 Module: Crop Monitoring and Soil Health Analysis
ID
Requirement
Priority
CROP-1
Farmer can add a crop to a farm: name, variety, sowing date, expected harvest date, status
P0
CROP-2
Full CRUD on crops; status values: planned, sown, growing, harvested
P0
CROP-3
Farmer can log activities (irrigation, fertilizing, spraying, weeding) with date and notes
P0
SOIL-1
Farmer can submit soil data: pH, nitrogen, phosphorus, potassium, moisture
P0
SOIL-2
System computes a soil health score (0 to 100) and a rating (poor, fair, good, excellent)
P0
SOIL-3
System returns plain-language recommendations (for example lime for acidic soil, add nitrogen)
P0
SOIL-4
Soil reports are stored per crop and displayed as a trend chart
P1
SOIL-5
Printable or downloadable soil report
P2
Soil scoring logic (v1, rule-based): each parameter is scored against an ideal range, weighted, and summed. For example, pH 6.0 to 7.5 earns full marks, and values outside the range lose points in proportion to the deviation. N, P, K, and moisture are scored against crop-agnostic thresholds. Ranges are kept in a configuration file so they can be tuned later.
6.4 Module: Weather Forecasting and Pest Alerts
ID
Requirement
Priority
WTH-1
Display current weather for the farm's location (temperature, humidity, wind, rainfall)
P0
WTH-2
Display a 5-day forecast
P0
WTH-3
Data is fetched from the OpenWeatherMap API; the key is stored server-side only
P0
WTH-4
Weather responses are cached in WeatherData to limit API calls
P1
WTH-5
Charts for temperature and rainfall trends
P1
PEST-1
Rule-based pest and disease alerts from weather conditions (for example humidity above 80% with temperature 20 to 30 C raises a fungal risk warning)
P0
PEST-2
Alerts are shown on the dashboard with severity (low, medium, high) and recommended action
P0
PEST-3
Admin can publish manual region-wide pest alerts
P1
PEST-4
Graceful fallback message if the weather API is unavailable
P0
6.5 Module: Resource Store and Order Tracking
ID
Requirement
Priority
STORE-1
Browse resources (seeds, fertilizers, pesticides, tools) with search, category filter, and pagination
P0
STORE-2
Resource detail view with price, stock, and description
P0
STORE-3
Cart: add, update quantity, remove; persisted across refresh
P0
STORE-4
Place an order with delivery address; stock is validated and reduced
P0
STORE-5
My Orders page showing order list and status (pending, approved, shipped, delivered, rejected)
P0
STORE-6
Admin resource CRUD, including stock updates
P0
STORE-7
Admin approves or rejects orders and updates status
P0
STORE-8
Order cancellation by the farmer while still pending
P1
STORE-9
Product image upload
P2
6.6 Module: Expert Consultation and Community Forum
ID
Requirement
Priority
FRM-1
Farmer can create a post with title, body, and category (Crops, Soil, Pests, Market, Ask an Expert)
P0
FRM-2
Any logged-in user can reply to a post
P0
FRM-3
List posts with category filter and pagination
P0
FRM-4
Author or admin can delete a post or reply
P0
FRM-5
Admin can moderate or flag content
P1
FRM-6
Posts in "Ask an Expert" are highlighted for admins or experts
P1
6.7 Module: Admin Dashboard
ID
Requirement
Priority
ADM-1
Statistics cards: total users, farms, crops, orders, revenue
P0
ADM-2
User management: list, search, deactivate or delete
P0
ADM-3
Order management: approve, reject, update status
P0
ADM-4
Resource management: add, edit, delete, restock
P0
ADM-5
Forum moderation
P1
ADM-6
Charts: orders per month, user growth
P1
6.8 Module: Multilingual and Accessibility
ID
Requirement
Priority
I18N-1
Interface available in English, Hindi, and Marathi (expandable)
P0
I18N-2
Language switcher in the navbar; choice is persisted
P0
I18N-3
The user's preferred language is saved on their profile
P1
A11Y-1
Large tap targets, readable fonts, and icon-supported navigation for low-literacy users
P0
A11Y-2
Keyboard navigation and sufficient color contrast
P1
7. Key User Stories
Farmer
• As a farmer, I want to register and choose my language so that I can use the app comfortably.
• As a farmer, I want to add my farm and crops so that I can track them in one place.
• As a farmer, I want to enter my soil test values and get a simple score with advice so that I know what to add.
• As a farmer, I want a forecast and pest alerts for my location so that I can protect my crops in time.
• As a farmer, I want to order seeds and fertilizers and see the order status so that I can plan my season.
• As a farmer, I want to ask experts and other farmers questions so that I can solve problems quickly.
Admin
• As an admin, I want to manage the product catalog so that farmers see accurate prices and stock.
• As an admin, I want to approve orders and update their status so that fulfillment is organized.
• As an admin, I want to remove inappropriate posts so that the community stays useful and safe.
• As an admin, I want platform statistics so that I can monitor usage.
8. Non-Functional Requirements
Category
Requirement
Performance
API p95 under 500 ms for standard queries; lazy-loaded routes; indexed queries; pagination on lists
Scalability
Stateless API (JWT) so it can scale horizontally; modular services
Security
HTTPS in production, JWT auth, bcrypt, input validation and sanitization, helmet headers, CORS whitelist, no secrets in code
Reliability
Centralized error handling; graceful handling of third-party API failure
Usability
Mobile-first, simple navigation, icon plus text labels, loading and empty states, clear error messages
Compatibility
Latest Chrome, Firefox, Edge, Safari; Android and iOS browsers
Maintainability
Modular folder structure, thin controllers, reusable components, documented code
Observability
Request logging (morgan) and structured error logs
Accessibility
Reasonable WCAG 2.1 AA effort for contrast and keyboard use
9. System Architecture
9.1 Architecture Overview
A three-tier architecture:
1. Presentation layer: React.js single-page app (React Router, Axios, Bootstrap, react-i18next, Chart.js)
2. Application layer: Node.js and Express.js REST API (routes, controllers, services, middleware)
3. Data layer: MongoDB (Atlas or local) accessed through Mongoose
External service: OpenWeatherMap API, called only from the backend.
9.2 Request Flow
React component calls the Axios service layer, which sends an HTTP request with the JWT to the Express route. The request passes through middleware (auth, role check, validation), then the controller, then the service and Mongoose model, and finally the response returns as JSON.
9.3 Proposed Folder Structure
agri-tech/
  server/
    config/        db connection, constants
    models/        User, Farm, Crop, Resource, Order, WeatherData, Post
    controllers/   thin request handlers
    routes/        route definitions per module
    middleware/    auth, role, validation, errorHandler
    utils/         soilAnalyzer, pestAlerts, helpers
    server.js
  client/
    src/
      components/  reusable UI
      pages/       route-level pages
      context/     AuthContext, CartContext
      services/    Axios API modules
      i18n/        en.json, hi.json, mr.json
      hooks/  utils/
10. Data Model
All collections use MongoDB ObjectId references and timestamps.
Collection
Key Fields
Relationships
Users
name, email (unique), password (hash), role (farmer or admin), phone, language, isActive
Referenced by Farms, Orders, Posts
Farms
owner, name, location, areaInAcres, soilType, waterSource
owner references User
Crops
farm, name, variety, sowingDate, expectedHarvest, status, soilReports[], activityLogs[]
farm references Farm
Resources
name, category, price, stock, description, image
Referenced by Orders
Orders
user, items[{resource, qty, price}], totalAmount, address, status
user references User; items reference Resources
WeatherData
location, date, temperature, humidity, rainfall, forecast, pestAlert
Cached per location
Posts
author, title, body, category, replies[{author, body, createdAt}]
author references User
Embedded sub-documents: soilReports (pH, N, P, K, moisture, score, rating, recommendations, date) and activityLogs (type, date, notes) are embedded in Crops because they are always read with the crop.
Indexes: Users.email (unique), Farms.owner, Crops.farm, Orders.user, Resources.category, Posts.category, WeatherData.location plus date.
11. API Specification (Summary)
Base URL: /api. All protected routes require the header Authorization: Bearer <token>.
Module
Method and Endpoint
Access
Auth
POST /auth/register
Public
Auth
POST /auth/login
Public
Auth
GET /auth/me, PUT /auth/me
Authenticated
Farms
GET, POST /farms
Farmer
Farms
GET, PUT, DELETE /farms/:id
Owner or admin
Crops
GET, POST /farms/:farmId/crops
Owner
Crops
GET, PUT, DELETE /crops/:id
Owner
Crops
POST /crops/:id/activities
Owner
Soil
POST /crops/:id/soil, GET /crops/:id/soil
Owner
Weather
GET /weather?location=
Authenticated
Alerts
GET /alerts, POST /alerts
Authenticated; POST is admin only
Resources
GET /resources, GET /resources/:id
Public
Resources
POST, PUT, DELETE /resources
Admin
Orders
POST /orders, GET /orders/my, GET /orders/:id
Authenticated
Orders
GET /orders, PUT /orders/:id/status
Admin
Forum
GET /posts, GET /posts/:id
Authenticated
Forum
POST /posts, POST /posts/:id/replies
Authenticated
Forum
DELETE /posts/:id
Author or admin
Admin
GET /admin/stats, GET /admin/users, DELETE /admin/users/:id
Admin
Standard response format: { success: true, data: ... } on success and { success: false, message: "...", errors: [...] } on failure. Status codes in use: 200, 201, 400, 401, 403, 404, 409, 500.
12. UI/UX Requirements
12.1 Pages
Page
Route
Access
Home (landing)
/
Public
Login, Register
/login, /register
Public
Farmer Dashboard
/dashboard
Farmer
My Farms
/farms
Farmer
Crop Tracker
/crops
Farmer
Soil Analysis
/soil
Farmer
Weather and Alerts
/weather
Farmer
Store, Cart
/store, /cart
Public (checkout needs login)
My Orders
/orders
Farmer
Forum, Post detail
/forum, /forum/:id
Authenticated
Admin Dashboard
/admin
Admin
12.2 Design Principles
• Mobile-first, single-column layouts on small screens
• Icon plus label on every primary action
• Calm green and earth-tone palette with high contrast
• Visual feedback everywhere: spinners, toasts, empty states, and confirmation dialogs for destructive actions
• Charts for weather trends, soil health history, crop statistics, and admin analytics
• Navbar with language switcher and role-based links
13. Security Requirements
1. JWT authentication with expiry; token sent in the Authorization header.
2. Role middleware (authorize('admin')) on every admin route.
3. Ownership checks so a farmer cannot read or modify another farmer's data.
4. bcrypt password hashing; passwords are never returned in responses.
5. express-validator on all inputs; protection against NoSQL injection by sanitizing query operators.
6. helmet, CORS restricted to the frontend origin, and rate limiting on auth routes.
7. Secrets only in .env; .env.example provided; .env excluded from Git.
8. Admin-only operations: user management, resource approval, content moderation, order status changes.
14. Testing and Validation Plan
Type
Scope
Tool
API testing
All endpoints, valid and invalid input, with and without token, farmer against admin routes (expect 403)
Postman
Functional testing
CRUD for farms, crops, resources, orders, posts; auth flows
Manual checklist and browser testing
Data validation
Soil score calculation, pest alert rules, weather response parsing
Unit tests (Jest, optional)
UI testing
Responsiveness at mobile, tablet, and desktop widths; language switching
Browser DevTools
Compatibility
Chrome, Firefox, Edge, Safari
Manual
Security checks
Token tampering, expired token, privilege escalation attempts
Postman
Acceptance criteria for release: all P0 requirements implemented and passing; no critical or high bugs open; every protected route verified for 401 and 403 behavior; core flows (register, add farm, add crop, soil analysis, order, forum post) work end to end on a mobile viewport.
15. Development Plan and Milestones
Phase
Deliverable
Est. Duration
1
Environment setup, folder structure, Git
1 to 2 days
2
DB connection and Mongoose models, seed data
2 days
3
Auth and role-based security (backend and frontend)
3 to 4 days
4
Farm and Crop modules
4 days
5
Soil analysis, weather, pest alerts
4 days
6
Resource store and orders
4 days
7
Forum and expert consultation
3 days
8
Admin dashboard
3 days
9
Multilingual support, charts, UI polish
3 days
10
Testing, optimization, documentation
3 to 4 days
Estimates assume a single developer working with AI-assisted tooling; adjust them to your schedule.
16. Risks and Mitigations
Risk
Impact
Mitigation
Weather API rate limits or downtime
Missing forecasts
Cache results in MongoDB; show last known data with a timestamp
Inaccurate soil recommendations
Poor farmer decisions
Keep rules configurable; label output as guidance, not a laboratory result
Low literacy and poor connectivity
Low adoption
Icons, regional languages, lightweight pages, lazy loading
Scope creep
Delays
Strict P0, P1, P2 prioritization; defer non-goals
Security flaws in role handling
Data exposure
Central middleware, ownership checks, Postman negative tests
Poor translation quality
Confusion
Review translations with native speakers
17. Assumptions and Dependencies
• Users have a smartphone or computer with a browser and an internet connection.
• An OpenWeatherMap API key (free tier) is available.
• MongoDB Atlas or a local MongoDB instance is available.
• Node.js v16 or later is installed.
• Payment is simulated (cash on delivery or manual approval) in version 1.
18. Future Enhancements
• Payment gateway integration (Razorpay or Stripe)
• SMS and WhatsApp alerts for pest warnings
• AI-based crop disease detection from photos
• Crop recommendation engine based on soil and season
• Market price tracking and mandi rates
• Offline support (PWA) for low-connectivity areas
• Voice-based navigation for low-literacy users
• Government scheme information and subsidy tracking
• Native mobile apps
19. Expected Outcomes
On completion, the project delivers a working full-stack agricultural management platform with role-based authentication, a data-driven and responsive interface, secure REST APIs, and a scalable design for managing large datasets and real-time agricultural insights.