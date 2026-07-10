from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

from app.graph.state import WorkflowState
from app.graph.nodes import (
    story_node,
    testcase_node,
    playwright_node,
)

builder = StateGraph(WorkflowState)

builder.add_node("story", story_node)
builder.add_node("testcase", testcase_node)
builder.add_node("playwright", playwright_node)

builder.add_edge(START, "story")
builder.add_edge("story", "testcase")
builder.add_edge("testcase", "playwright")
builder.add_edge("playwright", END)

memory = MemorySaver()

graph = builder.compile(
    checkpointer=memory,
    interrupt_after=["story", "testcase"]
)