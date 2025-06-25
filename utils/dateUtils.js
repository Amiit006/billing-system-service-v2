function isWithinRange(test, start, end) {
    const testDate = new Date(test);
    return (
      testDate.getTime() === new Date(start).getTime() ||
      testDate.getTime() === new Date(end).getTime() ||
      (testDate > new Date(start) && testDate < new Date(end))
    );
  }
  
  module.exports = { isWithinRange };
  