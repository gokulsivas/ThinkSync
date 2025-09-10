from jose import jwt
from datetime import datetime, timedelta
import os
from typing import Optional

# JWT Configuration Constants
SECRET_KEY = os.getenv('JWT_SECRET', 'ThinkSync2025SecureJWTSecretKeyForResearchPlatformVeryLongAndRandom')
ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create JWT access token for ThinkSync users
    
    Args:
        data: Dictionary containing user data (usually {'sub': user.email})
        expires_delta: Optional custom expiration time
    
    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()
    
    # Set expiration time
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)  # Default 15 minutes
    
    # Add expiration claim to payload
    to_encode.update({'exp': expire})
    
    # Encode JWT token
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return encoded_jwt

def verify_token(token: str) -> dict:
    """
    Verify and decode JWT token
    
    Args:
        token: JWT token string
        
    Returns:
        Decoded token payload
        
    Raises:
        JWTError: If token is invalid or expired
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise ValueError("Token has expired")
    except jwt.JWTError:
        raise ValueError("Invalid token")

def get_current_user_email(token: str) -> str:
    """
    Extract user email from JWT token
    
    Args:
        token: JWT token string
        
    Returns:
        User email from token subject claim
    """
    try:
        payload = verify_token(token)
        email: str = payload.get('sub')
        if email is None:
            raise ValueError("Token missing subject claim")
        return email
    except Exception as e:
        raise ValueError(f"Could not validate credentials: {str(e)}")
