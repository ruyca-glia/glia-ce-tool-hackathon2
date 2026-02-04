document.addEventListener('DOMContentLoaded', function() {
    const selector = document.getElementById('sheetSelector');
    const iframe = document.getElementById('sheetViewer');
    const placeholder = document.getElementById('frame-placeholder');

    selector.addEventListener('change', function() {
        const selectedUrl = this.value;

        if (selectedUrl) {
            // Hide placeholder, show iframe
            placeholder.style.display = 'none';
            iframe.style.display = 'block';
            
            // Set the source
            iframe.src = selectedUrl;
        }
    });
});