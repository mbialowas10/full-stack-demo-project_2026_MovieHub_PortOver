/**
 * Footer - an end mark for webpage
 * 
 */

const testBackend = async () => {
  console.log("Testing backend...");

  try {
    const response = await fetch("http://localhost:3000/api/v1/reviews");

    console.log("Backend status:", response.status);

    const data = await response.json();

    console.log("Backend response:", data);
  } catch (error) {
    console.error("Backend connection failed:", error);
  }
};

const Footer = () => {
    return (  
        <>
            <p style={{float:"right"}}>@CopyWrong 2025 - Michael Bialowas</p>


            <button type="button" onClick={testBackend}>
                Test Backend
            </button>
        </>
    );
}

export default Footer;