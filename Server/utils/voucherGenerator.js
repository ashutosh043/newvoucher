const voucherGenerator = () => {
    return Math.random().toString(36).substr(2, 8).toUpperCase();  // Example: 8GJ2KQ9X
};

module.exports = voucherGenerator;