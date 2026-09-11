from collections import deque

class ConversationMemory:
    def __init__(self, max_history=5):
        self.history = deque(maxlen=max_history)

    def add_message(self, role, message):
        self.history.append({
            "role": role,
            "message": message
        })

    def get_context(self):
        context = ""

        for item in self.history:
            context += f"{item['role']}: {item['message']}\n"

        return context


if __name__ == "__main__":
    memory = ConversationMemory()

    memory.add_message("User", "Show revenue")
    memory.add_message("AI", "Revenue displayed")
    memory.add_message("User", "Now show only South")

    print(memory.get_context())