document.addEventListener('DOMContentLoaded', () => {
    const loadTranslations = async () => {
      const buttons = document.querySelectorAll('.translate-btn');
      
      buttons.forEach(button => {
        button.addEventListener('click', async (e) => {
          const btn = e.target;
          const originalText = btn.dataset.original;
          const targetLang = navigator.language.split('-')[0];
          const textContainer = btn.previousElementSibling;
  
          btn.disabled = true;
          btn.innerHTML = `<span class="spinner"></span> Translating...`;
  
          try {
            const response = await fetch('http://localhost:3000/translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ originalText, targetLanguage: targetLang })
            });
  
            const { translation } = await response.json();
            textContainer.textContent = translation;
            btn.textContent = "Translated!";
          } catch (error) {
            btn.textContent = "Error - Try Again";
          } finally {
            setTimeout(() => {
              btn.textContent = "Translate";
              btn.disabled = false;
            }, 2000);
          }
        });
      });
    };
  
    // Handle dynamic content
    const observer = new MutationObserver(loadTranslations);
    observer.observe(document.body, { childList: true, subtree: true });
    loadTranslations();
  });