const sensitiveWords = ['xấu', 'tệ', 'kém', 'lừa đảo']; // Thêm các từ bạn muốn lọc vào đây

exports.filterContent = (text) => {
    let filteredText = text;
    sensitiveWords.forEach(word => {
        const regex = new RegExp(word, 'gi');
        filteredText = filteredText.replace(regex, '****');
    });
    return filteredText;
};