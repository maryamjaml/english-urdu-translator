
const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");
const direction = document.getElementById("direction");

const translateBtn = document.getElementById("translateBtn");
const btnText = document.getElementById("btnText");

const charCount = document.getElementById("charCount");
const errorMessage = document.getElementById("errorMessage");
const outputStatus = document.getElementById("outputStatus");

const copyBtn = document.getElementById("copyBtn");
const clearBtn = document.getElementById("clearBtn");
const swapBtn = document.getElementById("swapBtn");

const sourceLabel = document.getElementById("sourceLabel");
const targetLabel = document.getElementById("targetLabel");


// Update language labels
function updateLabels() {

    if (direction.value === "en-ur") {
        sourceLabel.textContent = "English";
        targetLabel.textContent = "اردو";
        inputText.placeholder = "Type English text here...";
    } else {
        sourceLabel.textContent = "اردو";
        targetLabel.textContent = "English";
        inputText.placeholder = "اردو میں اپنا متن لکھیں...";
    }
}


// Character counter
inputText.addEventListener("input", () => {
    charCount.textContent = `${inputText.value.length} / 3000`;
    errorMessage.textContent = "";
});


// Language selection
direction.addEventListener("change", updateLabels);


// Swap languages
swapBtn.addEventListener("click", () => {

    direction.value =
        direction.value === "en-ur" ? "ur-en" : "en-ur";

    const previousInput = inputText.value;
    const previousOutput = outputText.textContent;

    inputText.value =
        previousOutput === "Your translation will appear here..."
            ? ""
            : previousOutput;

    outputText.textContent = previousInput ||
        "Your translation will appear here...";

    charCount.textContent = `${inputText.value.length} / 3000`;

    copyBtn.disabled = !previousInput;
    outputStatus.textContent = "Ready to translate";

    updateLabels();
    errorMessage.textContent = "";
});


// Clear text
clearBtn.addEventListener("click", () => {

    inputText.value = "";
    outputText.textContent = "Your translation will appear here...";

    charCount.textContent = "0 / 3000";
    outputStatus.textContent = "Ready to translate";

    copyBtn.disabled = true;
    errorMessage.textContent = "";
});


// Translation function
async function translate() {

    const text = inputText.value.trim();

    if (!text) {
        errorMessage.textContent = "Please enter some text first.";
        inputText.focus();
        return;
    }

    translateBtn.disabled = true;
    btnText.textContent = "Translating...";

    errorMessage.textContent = "";
    outputStatus.textContent = "Processing your text...";
    outputText.textContent = "Please wait...";
    copyBtn.disabled = true;

    try {

        const response = await fetch("/translate", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                text: text,
                direction: direction.value
            })

        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || "Translation failed.");
        }

        outputText.textContent = data.translation;
        outputStatus.textContent = "Translation complete";

        copyBtn.disabled = !data.translation;

    } catch (error) {

        outputText.textContent = "Translation unavailable.";
        outputStatus.textContent = "Error";

        errorMessage.textContent = error.message;

    } finally {

        translateBtn.disabled = false;
        btnText.textContent = "Translate Text";

    }
}


// Translate button
translateBtn.addEventListener("click", translate);


// Copy output
copyBtn.addEventListener("click", async () => {

    const result = outputText.textContent;

    try {
        await navigator.clipboard.writeText(result);

        copyBtn.textContent = "Copied!";

        setTimeout(() => {
            copyBtn.textContent = "Copy ↗";
        }, 1500);

    } catch {
        errorMessage.textContent = "Could not copy text.";
    }

});


// Example sentences
document.querySelectorAll(".example-btn").forEach(button => {

    button.addEventListener("click", () => {

        direction.value = "en-ur";
        inputText.value = button.dataset.text;

        charCount.textContent =
            `${inputText.value.length} / 3000`;

        updateLabels();

        translate();

    });

});


// Keyboard shortcut: Ctrl + Enter
inputText.addEventListener("keydown", event => {

    if (event.ctrlKey && event.key === "Enter") {
        translate();
    }

});


// Initial setup
updateLabels();
