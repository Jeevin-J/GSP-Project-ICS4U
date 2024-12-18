import json

class NoteApp:
    def __init__(self):
        self.notes = []

    def add_note(self, note):
        self.notes.append(note)
        print("Note added!")

    def view_notes(self):
        if not self.notes:
            print("No notes available.")
            return
        for idx, note in enumerate(self.notes, start=1):
            print(f"{idx}: {note}")

    def save_notes(self, filename="notes.json"):
        with open(filename, "w") as file:
            json.dump(self.notes, file)
        print("Notes saved!")

    def load_notes(self, filename="notes.json"):
        try:
            with open(filename, "r") as file:
                self.notes = json.load(file)
            print("Notes loaded!")
        except FileNotFoundError:
            print("No saved notes found.")

if __name__ == "__main__":
    app = NoteApp()
    while True:
        print("\n1. Add Note\n2. View Notes\n3. Save Notes\n4. Load Notes\n5. Exit")
        choice = input("Choose an option: ")
        if choice == "1":
            note = input("Enter your note: ")
            app.add_note(note)
        elif choice == "2":
            app.view_notes()
        elif choice == "3":
            app.save_notes()
        elif choice == "4":
            app.load_notes()
        elif choice == "5":
            print("Goodbye!")
            break
        else:
            print("Invalid choice. Try again.")
