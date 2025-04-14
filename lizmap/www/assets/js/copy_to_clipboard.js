window.onload = () => {
  if (navigator.clipboard) {
    document.querySelectorAll('.copy-to-clipboard').forEach((el) => {
      el.addEventListener('click', (evt) => {
        const button = evt.target;
        const text = button.dataset.text;
        if (text) {
          navigator.clipboard.writeText(text).then(() => {
            button.classList.add('btn-success');
            setTimeout(() => {
              button.classList.remove('btn-success');
            }, '1500');
          });
        }
      });
    });
  }
  else {
    // Website is maybe without HTTPS
    document.querySelectorAll('.copy-to-clipboard').forEach((el) => {
        el.style.display = "none";
    });
    console.log("The clipboard API is not enabled");
  }
};
