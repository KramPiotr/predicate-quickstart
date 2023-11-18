import { useEffect, useState } from "react";
import "./App.css";
import { Predicate, Provider, FUEL_NETWORK_URL, Address } from 'fuels';
// Import the contract factory -- you can find the name in index.ts.
// You can also do command + space and the compiler will suggest the correct name.
import { SimplePredicateAbi__factory } from "./contracts";
import { SimplePredicateAbi } from "./contracts";
import bytecode from "./contracts/SimplePredicateAbi.hex";

function App() {
  const [connected, setConnected] = useState<boolean>(false);
  const [accountFrom, setAccountFrom] = useState<string>("");
  const [accountTo, setAccountTo] = useState<string>("");
  const [loaded, setLoaded] = useState(false);
  const [toWithdraw, setToWithdraw] = useState(0);

  const [amount, setAmount] = useState<number>(0); // Using '' to represent an empty amount

  const getPredicate = async () => {
    const provider = await Provider.create(FUEL_NETWORK_URL);
    return new Predicate(bytecode, provider, SimplePredicateAbi__factory.abi, {
      SENDER: accountFrom,
      RECIPIENT: accountTo
    });
  }

  const sendToPredicate = async () => {
    if (accountTo && amount > 0) {
      if (window.fuel) {
        console.log("send to predicate", accountFrom, accountTo, amount);
        const wallet = await window.fuel.getWallet(accountFrom);
        const predicate = await getPredicate();
        const tx = await wallet.transfer(predicate.address, amount);
        await tx.waitForResult();
      } 
    } else {
      console.error('Invalid inputs');
    }
  };

  const withdrawFromPredicate = async () => {
    const predicate = await getPredicate();
    predicate.transfer(Address.fromString(accountFrom), toWithdraw);
  }

  useEffect(() => {
    setTimeout(() => {
      checkConnection();
      setLoaded(true);
    }, 200)
  }, [connected])

  async function connect() {
    if (window.fuel) {
      try {
        await window.fuel.connect();
        const [accountFrom] = await window.fuel.accounts();
        setAccountFrom(accountFrom);
        setConnected(true);
      } catch (err) {
        console.log("error connecting: ", err);
      }
    }
  }

  async function checkConnection() {
    if (window.fuel) {
      const isConnected = await window.fuel.isConnected();
      if (isConnected) {
        const [accountFrom] = await window.fuel.accounts();
        setAccountFrom(accountFrom);
        console.log("Account connected", accountFrom);
        setConnected(true);
      }
    }
  }

  if (!loaded) return null

  return (
    <>
      <div className="App">
        {
          connected ? (
            <>
              <div style={{height: "20vh"}}></div>
              <div>
                <label>
                  Address to share the predicate with:
                  <input
                  type="string"
                  value={accountTo}
                  onChange={(e) => setAccountTo(e.target.value)}
                  />
                </label>
                <br />
                <label>
                  Amount to deposit:
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value))}
                  />
                </label>
                <br />
                <button onClick={sendToPredicate}>Deposit</button>
              </div>
              <div style={{height: "20vh"}}></div>
              <div>
                <label>Amount to withdraw:
                <input 
                type="number"
                value={toWithdraw}
                onChange={(e) => setToWithdraw(parseFloat(e.target.value))}
                /></label>
                <br/>
                <button onClick={withdrawFromPredicate}>Withdraw</button>
              </div>
            </>
          ) : (
            <button style={buttonStyle} onClick={connect}>Connect</button>
          )
        }
      </div>
    </>
  );
}

export default App;

const buttonStyle = {
  borderRadius: "48px",
  marginTop: "10px",
  backgroundColor: "#03ffc8",
  fontSize: "20px",
  fontWeight: "600",
  color: "rgba(0, 0, 0, .88)",
  border: "none",
  outline: "none",
  height: "60px",
  width: "400px",
  cursor: "pointer"
}
