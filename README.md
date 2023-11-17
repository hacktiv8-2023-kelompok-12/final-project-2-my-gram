# Final Project 2 - My Gram

## Group 12

Moch Bima Pangestu
Ipung Dwi Ari Saputra

## API

```bash
# My Gram API
https://final-project-2-my-gram-production-3311.up.railway.app/

```

## Usage Example for User API
1. Register
   
```bash
#Post
https://final-project-2-my-gram-production-3311.up.railway.app/login/user/register

```

```bash
#Post
{
  "email": "test@gmail.com",
  "full_name": "John Doe",
  "username": "john",
  "password": "strong_password_here",
  "profile_image_url": "https://example.com/profile-image.jpg",
  "age": 25,
  "phone_number": "123456789"
}

```

2. Login

```bash
#Post
https://final-project-2-my-gram-production-3311.up.railway.app/login/user/login

```

```bash
#Post
{
  "email": "test@gmail.com",
  "password": "strong_password_here",
}


 
