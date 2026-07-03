const defaultContent = {
    heroTitle: "Spesialis Buket Premium di Kota Sorong",
    heroDesc: "Berikan kejutan tak terlupakan untuk orang terkasih. Kami menghadirkan kreasi buket bunga, uang, dan snack estetik dengan ciri khas Korean Wrapping yang cantik dan elegan.",
    aboutTitle: "Tentang Nami Craft",
    aboutDesc: "Didirikan pada tahun 2019 oleh Ibu Ratna, Nami Craft berawal dari inovasi dan jeli melihat peluang di Kota Sorong. Kami hadir untuk melengkapi momen spesial Anda—mulai dari wisuda, ulang tahun, hingga anniversary. Dengan detail Korean Wrapping yang kekinian, setiap buket dirangkai penuh cinta untuk menyampaikan perasaan Anda kepada sosok yang berharga."
};

function loadCurrentContent() {
    const section = document.getElementById('sectionSelect').value;
    const savedContent = localStorage.getItem('nami_' + section) || defaultContent[section];
    document.getElementById('contentInput').value = savedContent;
}

function saveContent(e) {
    e.preventDefault(); 
    const section = document.getElementById('sectionSelect').value;
    const newContent = document.getElementById('contentInput').value;
    
    localStorage.setItem('nami_' + section, newContent);
    
    const msg = document.getElementById('successMsg');
    msg.style.display = 'block';
    setTimeout(() => { msg.style.display = 'none'; }, 3000);
}

// Inisialisasi saat halaman admin dimuat
window.onload = function() {
    if(document.getElementById('sectionSelect')) {
        loadCurrentContent();
    }
};