from flask import Flask, render_template, request, redirect, url_for
import json

app = Flask(__name__)

# Load notes from a file
def load_notes(filename="notes.json"):
    try:
        with open(filename, "r") as file:
            return json.load(file)
    except FileNotFoundError:
        return []

# Save notes to a file
def save_notes(notes, filename="notes.json"):
    with open(filename, "w") as file:
        json.dump(notes, file)

# Initialize notes
notes = load_notes()

@app.route("/")
def home():
    return render_template("index.html", notes=notes)

@app.route("/add", methods=["POST"])
def add_note():
    note = request.form["note"]
    notes.append(note)
    save_notes(notes)
    return redirect(url_for("home"))

@app.route("/delete/<int:note_index>")
def delete_note(note_index):
    if 0 <= note_index < len(notes):
        notes.pop(note_index)
        save_notes(notes)
    return redirect(url_for("home"))

if __name__ == "__main__":
    app.run(debug=True)
