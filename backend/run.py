from app import app as flask_app
app = flask_app  # Vercel looks for 'app' variable

if __name__ == '__main__':
    app.run(debug=True)
