from app.agents.story_agent import story_agent
from app.agents.testcase_agent import testcase_agent
from app.agents.playwright_agent import playwright_agent


def story_node(state):
    return story_agent(state)


def testcase_node(state):
    return testcase_agent(state)


def playwright_node(state):
    return playwright_agent(state)