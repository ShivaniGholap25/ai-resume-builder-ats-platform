from flask import Flask, render_template, request, send_file, redirect, url_for
from xhtml2pdf import pisa
from io import BytesIO
import time

app = Flask(__name__)

# Home route — displays the form
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/preview', methods=['POST'])
def preview():
    data = request.form.to_dict()
    return render_template('resume_template.html', data=data, preview=True)

@app.route('/download', methods=['POST'])
def download():
    try:
        data = request.form.to_dict()
        html = render_template('resume_template.html', data=data, preview=False)
        pdf = BytesIO()
        result = pisa.CreatePDF(src=html, dest=pdf)
        if result.err:
            return render_template('error.html', message="Failed to generate PDF."), 500
        pdf.seek(0)
        return send_file(pdf, as_attachment=True, download_name="resume.pdf", mimetype="application/pdf")
    except Exception as e:
        print(f"Error: {e}")
        return render_template('error.html', message="Unexpected error occurred. Please try again."), 500

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)
