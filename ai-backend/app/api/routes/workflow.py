
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.agents.playwright_agent import PlaywrightAgentError
from app.agents.testcase_agent import TestCaseAgentError
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
        "test_cases": [],
        "playwright_script": "",
    }

    try:
        result = graph.invoke(state, config=config)
    except (PlaywrightAgentError, TestCaseAgentError) as exc:
        return JSONResponse(
            status_code=502,
            content={"detail": exc.message, "error_code": exc.error_code},
        )

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

    try:
        return graph.invoke(None, config=config)
    except (PlaywrightAgentError, TestCaseAgentError) as exc:
        return JSONResponse(
            status_code=502,
            content={"detail": exc.message, "error_code": exc.error_code},
        )