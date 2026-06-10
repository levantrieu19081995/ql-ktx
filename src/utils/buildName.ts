  export const   buildTenPhi = (
    tenPhiGoc: string,
    formattedDateTime: string,
    maxLength = 50
  ) => {
    const suffix = `... ${formattedDateTime}`;
    const maxMainLength = maxLength - suffix.length;

    if (tenPhiGoc.length + 1 + formattedDateTime.length <= maxLength) {
      return `${tenPhiGoc} ${formattedDateTime}`;
    }

    if (maxMainLength <= 0) {
      // Trường hợp cực đoan (formattedDateTime quá dài)
      return formattedDateTime.slice(0, maxLength);
    }

    return `${tenPhiGoc.slice(0, maxMainLength)}${suffix}`;
  };