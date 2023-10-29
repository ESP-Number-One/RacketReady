from flask import Flask, render_template

app = Flask(__name__)


@app.get('/')
def fill_form():
    return render_template('index.html')
