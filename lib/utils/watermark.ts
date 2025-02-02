export const addWatermark = (content: string): string => {
  const disclaimer = '--- FOR INFORMATIONAL PURPOSES ONLY - NOT LEGAL ADVICE ---';
  const separator = '\n' + '='.repeat(80) + '\n';
  
  return `${disclaimer}${separator}${content}${separator}${disclaimer}`;
};

export const addHtmlWatermark = (content: string): string => {
  const disclaimer = `
    <div style="
      background-color: #ffebee;
      color: #c62828;
      padding: 10px;
      margin: 10px 0;
      border: 2px solid #c62828;
      text-align: center;
      font-weight: bold;
    ">
      FOR INFORMATIONAL PURPOSES ONLY - NOT LEGAL ADVICE
    </div>
  `;
  
  return `${disclaimer}${content}${disclaimer}`;
};