from fastapi import APIRouter
 
router = APIRouter()
 
@router.get("/readiness")
def readiness():
    return {
        "ready": True,
        "message": "Backend is ready"
    }
 