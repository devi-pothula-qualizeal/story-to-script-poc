from fastapi import APIRouter
from pydantic import BaseModel

from app.graph.workflow import graph

router = APIRouter()


class StartWorkflowRequest(BaseModel):
    description: str
    acceptance_criteria: str
    thread_id: str


class NextWorkflowRequest(BaseModel):
    thread_id: str


@router.post("/start")
def start_workflow(request: StartWorkflowRequest):
    config = {
        "configurable": {
            "thread_id": request.thread_id
        }
    }

    state = {
        "description": request.description,
        "acceptance_criteria": request.acceptance_criteria,
        "refined_user_story": "",
        "test_cases": "",
        "playwright_script": "",
    }

    result = graph.invoke(state, config=config)

    return {
        "thread_id": request.thread_id,
        "result": result,
    }


@router.post("/next")
def next_workflow(request: NextWorkflowRequest):
    config = {
        "configurable": {
            "thread_id": request.thread_id
        }
    }

    return graph.invoke(None, config=config)
