# Furniture Marketplace

## Project Overview
Furniture Marketplace is a full-stack web application that allows users to buy and sell furniture items. It features a React frontend for a smooth user experience and a Django backend for robust data management and API services. The application utilizes AWS S3 for image storage and CloudFront for efficient content delivery.

## Key Features
- User authentication and authorization
- Listing creation, management, and browsing
- Image upload and management for listings, using AWS S3 and CloudFront
- Search and filter functionality for furniture items
- Responsive design for various devices

## Tech Stack
### Frontend
- React
- SCSS for styling
- Axios for API requests

### Backend
- Django
- Django Rest Framework
- PostgreSQL database
- AWS S3 for image storage
- AWS CloudFront for content delivery

## Project Structure
```
furniture-marketplace/
│
├── backend/
│   ├── backend/  # Main Django app
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── utils.py  # S3 and CloudFront integrations
│   │   └── permissions.py  # Custom permissions
│   │
│   ├── listings/  # Listings app
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   └── urls.py
│   │
│   └── users/  # Users app
│       ├── models.py
│       ├── views.py
│       ├── serializers.py
│       └── urls.py
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── styles/  
│   │   ├── api.js  
│   │   └── App.js
│   │
│   └── public/
│
└── .env  # Environment variables
```

## Key Components
### Backend
1. **Listings App**
   - `FurnitureListing` model for storing listing information
   - `ListingImage` model for managing multiple images per listing
   - RESTful API endpoints for CRUD operations on listings
   - Custom permissions to ensure only owners can edit their listings

2. **Users App**
   - Custom user model extending Django's built-in User
   - Authentication views for user registration and token generation

3. **S3 and CloudFront Integration**
   - Utility functions for generating pre-signed URLs for secure image access
   - Custom storage backend for handling image uploads to S3
   - CloudFront configuration for efficient content delivery of images

### Frontend
1. **API Integration**
   - Axios instance with request interceptor for attaching authentication tokens
   - Centralized API call handling

2. **Responsive Design**
   - SCSS used for flexible and maintainable styling
   - Mobile-first approach ensuring usability across devices

## Future Enhancements
- Update styling
- Implement real-time messaging between buyers and sellers
- Add a rating system for users
- Integrate a payment gateway for in-app transactions
- Ability to favorite/unfavorite listings
