import pdfplumber
import docx
import io
import re

def clean_text(text: str) -> str:
    """Basic text cleaning."""
    # Remove extra whitespaces
    text = re.sub(r'\s+', ' ', text)
    # Remove non-ascii characters (optional, but can help reduce noise)
    # text = text.encode("ascii", "ignore").decode()
    return text.strip()

def parse_pdf(file_bytes: bytes) -> str:
    """Extract text from a PDF file."""
    text = ""
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return clean_text(text)

def parse_docx(file_bytes: bytes) -> str:
    """Extract text from a DOCX file."""
    doc = docx.Document(io.BytesIO(file_bytes))
    text = "\n".join([para.text for para in doc.paragraphs])
    return clean_text(text)

def extract_text(file_bytes: bytes, filename: str) -> str:
    """Universal text extractor based on file extension."""
    if filename.lower().endswith('.pdf'):
        return parse_pdf(file_bytes)
    elif filename.lower().endswith('.docx'):
        return parse_docx(file_bytes)
    else:
        raise ValueError("Unsupported file format. Please upload PDF or DOCX.")
