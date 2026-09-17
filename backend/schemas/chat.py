from pydantic import BaseModel, Field, field_validator


class ChatRequest(BaseModel):
    question: str = Field(
        ...,
        min_length=1,
        max_length=500,
        description="User question"
    )

    @field_validator("question")
    @classmethod
    def validate_question(cls, value: str):
        if not value.strip():
            raise ValueError("Question cannot be empty.")
        return value