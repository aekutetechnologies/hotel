"""
PDF generation utilities for reports.
"""
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from io import BytesIO
from django.http import HttpResponse
import logging

logger = logging.getLogger("stats")


def generate_pdf_report(title, data, filename):
    """
    Generate a PDF report from data.
    
    Args:
        title: Report title
        data: List of dictionaries or list of lists for table data
        filename: Output filename
    
    Returns:
        HttpResponse with PDF content
    """
    try:
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        elements = []
        
        # Define styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=18,
            textColor=colors.HexColor('#B11E43'),
            spaceAfter=30,
            alignment=TA_CENTER
        )
        
        # Add title
        elements.append(Paragraph(title, title_style))
        elements.append(Spacer(1, 0.2 * inch))
        
        # Convert data to table format if needed
        if isinstance(data, list) and len(data) > 0:
            if isinstance(data[0], dict):
                # Convert list of dicts to table
                headers = list(data[0].keys())
                table_data = [headers]
                for row in data:
                    table_data.append([str(row.get(key, '')) for key in headers])
            else:
                # Already in table format
                table_data = data
        else:
            table_data = [['No data available']]
        
        # Create table
        table = Table(table_data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#D7E4BC')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.hexcolor('#000000')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
        ]))
        
        elements.append(table)
        
        # Build PDF
        doc.build(elements)
        buffer.seek(0)
        
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
    except Exception as e:
        logger.exception(f"Error generating PDF report: {str(e)}")
        raise


def generate_multi_sheet_pdf(title, sheets_data, filename):
    """
    Generate a PDF with multiple sections (like Excel sheets).
    
    Args:
        title: Report title
        sheets_data: Dict with sheet_name as key and list of data as value
        filename: Output filename
    
    Returns:
        HttpResponse with PDF content
    """
    try:
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        elements = []
        
        # Define styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=18,
            textColor=colors.HexColor('#B11E43'),
            spaceAfter=30,
            alignment=TA_CENTER
        )
        
        sheet_title_style = ParagraphStyle(
            'SheetTitle',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#B11E43'),
            spaceAfter=15,
            spaceBefore=20
        )
        
        # Add main title
        elements.append(Paragraph(title, title_style))
        elements.append(Spacer(1, 0.3 * inch))
        
        # Add each sheet as a section
        for sheet_name, data in sheets_data.items():
            elements.append(Paragraph(sheet_name, sheet_title_style))
            elements.append(Spacer(1, 0.1 * inch))
            
            # Convert data to table format
            if isinstance(data, list) and len(data) > 0:
                if isinstance(data[0], dict):
                    headers = list(data[0].keys())
                    table_data = [headers]
                    for row in data:
                        table_data.append([str(row.get(key, '')) for key in headers])
                else:
                    table_data = data
            else:
                table_data = [['No data available']]
            
            # Create table
            table = Table(table_data, repeatRows=1)
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#D7E4BC')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.hexcolor('#000000')),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('FONTSIZE', (0, 1), (-1, -1), 9),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
            ]))
            
            elements.append(table)
            elements.append(Spacer(1, 0.3 * inch))
            elements.append(PageBreak())
        
        # Build PDF
        doc.build(elements)
        buffer.seek(0)
        
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
    except Exception as e:
        logger.exception(f"Error generating multi-sheet PDF report: {str(e)}")
        raise

