// Global variable to track the current summarization mode
let summarizationMode = "normal";

// Wait for the DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded");
    
    // Get references to the buttons
    const businessBtn = document.getElementById('businessBtn');
    const technicalBtn = document.getElementById('technicalBtn');
    const themeToggle = document.getElementById('themeToggle');
    
    console.log("Buttons:", businessBtn, technicalBtn, themeToggle);
    
    // Set up event listeners
    if (businessBtn) {
        businessBtn.addEventListener('click', function() {
            console.log("Business button clicked");
            if (summarizationMode === "business") {
                summarizationMode = "normal";
                businessBtn.classList.remove('active');
            } else {
                summarizationMode = "business";
                businessBtn.classList.add('active');
                technicalBtn.classList.remove('active');
            }
            console.log("Mode is now:", summarizationMode);
        });
    }
    
    if (technicalBtn) {
        technicalBtn.addEventListener('click', function() {
            console.log("Technical button clicked");
            if (summarizationMode === "technical") {
                summarizationMode = "normal";
                technicalBtn.classList.remove('active');
            } else {
                summarizationMode = "technical";
                technicalBtn.classList.add('active');
                businessBtn.classList.remove('active');
            }
            console.log("Mode is now:", summarizationMode);
        });
    }
    
    // Theme toggle functionality
    if (themeToggle) {
        // Initialize the button text based on current theme
        if (document.body.classList.contains('light-mode')) {
            themeToggle.textContent = 'Dark Mode';
        } else {
            themeToggle.textContent = 'Light Mode';
        }
        
        themeToggle.addEventListener('click', function() {
            console.log("Theme toggle clicked");
            const body = document.body;
            if (body.classList.contains('light-mode')) {
                body.classList.remove('light-mode');
                themeToggle.textContent = 'Light Mode';
            } else {
                body.classList.add('light-mode');
                themeToggle.textContent = 'Dark Mode';
            }
        });
    }
});

async function summarize() {
    const input = document.getElementById('input').value;
    const output = document.getElementById('output');
    const button = document.getElementById('summarizeBtn');
    const customPrompt = document.getElementById('customPrompt').value.trim();

    if (!input.trim()) {
        alert('Please enter some text');
        return;
    }

    try {
        button.disabled = true;
        button.textContent = 'Summarizing...';
        
        console.log("Current mode:", summarizationMode);

        // Apply the new prompting structure
        let finalPrompt;

        if (customPrompt) {
            // Custom mode: User-provided instructions as system message
            finalPrompt = `
            <|begin_of_text|><|start_header_id|>system<|end_header_id|>
            ${customPrompt}<|eot_id|>
            <|start_header_id|>user<|end_header_id|>
            ${input}<|eot_id|>
            <|start_header_id|>assistant<|end_header_id|>`;
        } else if (summarizationMode === "business") {
            // Business mode: Financial analysis template
            finalPrompt = `
            <|begin_of_text|><|start_header_id|>system<|end_header_id|>
            You are a financial analyst. Create a business-focused summary that:
            - Preserves all numbers, percentages, monetary values, and dates
            - Highlights key revenue figures, growth rates, and financial metrics
            - Identifies business risks, opportunities, and timelines
            - Uses bullet points for clarity where appropriate
            - Maintains a professional tone
            - Focuses only on information present in the original text<|eot_id|>
            <|start_header_id|>user<|end_header_id|>
            ${input}<|eot_id|>
            <|start_header_id|>assistant<|end_header_id|>`;
        } else if (summarizationMode === "technical") {
            // Technical mode: Technical analysis template
            finalPrompt = `
            <|begin_of_text|><|start_header_id|>system<|end_header_id|>
            You are a technical expert. Create a technical summary that:
            - Identifies key specifications, technologies, and technical concepts
            - Preserves technical terminology, equations, and code snippets
            - Highlights challenges and their solutions
            - Uses clear headings and structured format for readability
            - Explains specialized terms briefly when context requires
            - Stays faithful to the technical relationships described in the text
            - Does not introduce information not present in the original<|eot_id|>
            <|start_header_id|>user<|end_header_id|>
            ${input}<|eot_id|>
            <|start_header_id|>assistant<|end_header_id|>`;
        } else {
            // Normal mode: General summarization
            finalPrompt = `
            <|begin_of_text|><|start_header_id|>system<|end_header_id|>
            You are a summarization assistant. Create a concise summary that:
            - Reduces the original text by approximately 50% to 60%
            - Preserves the main ideas and essential information
            - Maintains factual accuracy without adding new information
            - Uses clear, straightforward language
            - Follows a logical structure<|eot_id|>
            <|start_header_id|>user<|end_header_id|>
            ${input}<|eot_id|>
            <|start_header_id|>assistant<|end_header_id|>`;
        }

        console.log("Sending request with mode:", summarizationMode);
        
        const response = await fetch('http://localhost:8000/generate', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ prompt: finalPrompt })
        });

        if (!response.ok) throw new Error('API Error');

        const data = await response.json();
        output.value = data.response;
    } catch (error) {
        console.error("Error:", error);
        output.value = 'Error generating summary. Please try again.';
    } finally {
        button.disabled = false;
        button.textContent = 'Summarize';
    }
}
