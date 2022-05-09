const serverUrl = "https://2vhveixyxyvl.usemoralis.com:2053/server";
const appId = "k2eT4ZcMOtQgRTt7SJxwEo6DTA0ib96Da2B7hM08";
Moralis.start({ serverUrl, appId });
let user = Moralis.User.current();

async function login() {
  if (!user) {
    try {
      user = await Moralis.authenticate({ signingMessage: "Hello World!" });
      initApp();
    } catch (error) {
      console.log(error);
    }
  } else {
    Moralis.enableWeb3();
    initApp();
  }
}

function initApp() {
  document.querySelector("#app").style.display = "block";
  document.querySelector("#check_valid").onclick = checkValidity;
  document.querySelector("#submit_button").onclick = submit;
}
document.getElementById("submit_button").disabled = true;

var PersonName = "";
var SummaryAll = "";

async function checkValidity() {
  let tbody = document.getElementById("tbody");
  fetch("http://localhost:3000/person")
    .then((res) => res.json())
    .then((json) => {
      json.map((data) => {
        tbody.append(td_fun(data));
      });
    });
  function td_fun({ personname, nidno, fathername, mothername, dateofbirth }) {
    var nid1 = document.querySelector("#input_nidno").value;
    var Name1 = document.querySelector("#input_name").value;
    var fname1 = document.querySelector("#input_fathername").value;
    var mname1 = document.querySelector("#input_mothername").value;
    var dob1 = document.querySelector("#input_dateofbirth").value;
    const personObj = {
      personname,
      nidno,
      fathername,
      mothername,
      dateofbirth,
    };
    if (
      personObj.personname == Name1 &&
      personObj.nidno == nid1 &&
      personObj.fathername == fname1 &&
      personObj.mothername == mname1 &&
      personObj.dateofbirth == dob1
    ) {
      searchedTrue();
    } else {
      console.log("Person name, id didn't matched!");
    }
    function searchedTrue() {
      console.log("Person is valid");
      alert("Person is valid. You can Mint!");
      submitData();
    }
  }
}
function submitData() {
  var nid1 = document.querySelector("#input_nidno").value;
  var Name1 = document.querySelector("#input_name").value;
  var fname1 = document.querySelector("#input_fathername").value;
  var mname1 = document.querySelector("#input_mothername").value;
  var dob1 = document.querySelector("#input_dateofbirth").value;
  document.getElementById("submit_button").disabled = false;

  var nid = " ID No : " + nid1 + "\n";
  var fname = "Father Name: " + fname1 + "\n";
  var mname = "Mother Name: " + mname1 + "\n";
  var dob = "Date of Birth: " + dob1;

  let pn = document.getElementById("input_name2");
  PersonName = Name1;
  pn.innerHTML = `
  <div class="form_element">
  <input class="form-control type="text" ${PersonName}>
</div>
  `;
  let pn2 = document.getElementById("input_description");
  SummaryAll = nid + " " + fname + " " + mname + " " + dob;
  pn2.innerHTML = `
  <div class="form_element">
  <input class="form-control type="text" ${SummaryAll}>
</div>
  `;
}

async function submit() {
  const input = document.querySelector("#input_image");
  let data = input.files[0];
  const imageFile = new Moralis.File(data.name, data);
  await imageFile.saveIPFS();
  let imageHash = imageFile.hash();

  let metadata = {
    name: PersonName,
    description: SummaryAll,
    image: "/ipfs/" + imageHash,
  };
  console.log(metadata);
  const jsonFile = new Moralis.File("metadata.json", {
    base64: btoa(JSON.stringify(metadata)),
  });
  await jsonFile.saveIPFS();

  let metadataHash = jsonFile.hash();
  console.log(jsonFile.ipfs());
  let res = await Moralis.Plugins.rarible.lazyMint({
    chain: "rinkeby",
    userAddress: user.get("ethAddress"),
    tokenType: "ERC721",
    tokenUri: "ipfs://" + metadataHash,
  });
  console.log(res);
  document.querySelector(
    "#success_message"
  ).innerHTML = `NFT minted. <a href="https://rinkeby.rarible.com/token/${res.data.result.tokenAddress}:${res.data.result.tokenId}">View NFT`;
  document.querySelector("#success_message").style.display = "block";
  setTimeout(() => {
    document.querySelector("#success_message").style.display = "none";
  }, 10000);
}
login();
