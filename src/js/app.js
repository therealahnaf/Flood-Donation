App = {
  // wallet er reference, smart contract,accounts store kore
  webProvider: null,
  contracts: {},
  account: "0x0",

  initWeb: function () {
    const provider = window.ethereum;
    if (provider) {
      App.webProvider = provider;
    } else {
      $("#loader-msg").html("No metamask ethereum provider found");

      // default instance if no web3 instance
      App.webProvider = new Web3(
        new Web3.providers.HttpProvider("http://localhost:8545")
      );
    }

    return App.initContract();
  },

  initContract: function () {
    $.getJSON("fundForFloodVictims.json", function (fundForFloodVictims) {
      // instantiate a new truffle contract
      App.contracts.fundForFloodVictims = TruffleContract(fundForFloodVictims);

      // connect provider to interact with contract
      App.contracts.fundForFloodVictims.setProvider(App.webProvider);

      // incurring events
      App.listenForEvents();

      return App.render();
    });
  },

  render: async function () {
    // html loading text show kore
    const loader = $("#loader");
    // html content show kore
    const content = $("#content");

    loader.show();
    content.hide();

    // wallet open kore, account data load kore
    if (window.ethereum) {
      try {
        // request user to connect mmetamask
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        App.account = accounts;
        $("#accountAddress").html(
          `You have ${App.account.length} account connected from metamask: ${App.account} <br/> Current account in use: ${App.account[0]}`
        );
      } catch (error) {
        if (error.code === 4001) {
          // user request reject korle
          console.warn("user rejected");
        }
        $("#accountAddress").html("Your Account: Not Connected");
        console.error(error);
      }
    }

    loader.hide();
    content.show();
  },

  // Donor Registration when submitted with name and phone number
  DonorRegistration: async function () {
    const contractInstance = await App.contracts.fundForFloodVictims.deployed();

    // fetch inputs
    const name = document.getElementById("newUserName").value;
    const phone = document.getElementById("newUserPhone").value;

    const result = await contractInstance.DonorRegistration(name, phone, {
      from: App.account[0],
    });

    if (result) {
      alert("You have registered successfully!", result);
    } else {
      alert("Failed to register you", result);
    }
  },

  // Making donation (phone no, zone submit er somoy). Value asked from Metamask
  Donate: async function () {
    const contractInstance = await App.contracts.fundForFloodVictims.deployed();

    // fetching input
    const phone = document.getElementById("userPhone").value;
    const zone = document.getElementById("zoneSelect").value;

    const etherAmount = Number(
      prompt("Please enter the amount of donation in ETH: ")
    );

    const result = await contractInstance.Donate(phone, zone, {
      from: App.account[0],
      value: etherAmount * 10 ** 18,
    });

    if (result) {
      alert("Thanks a lot for the donation! God bless you.", result);

      // reload pthe window
      window.location.reload();
    } else {
      alert("Failed to receive your donation :(", result);
    }
  },

  // total fund ammount show kore
  getDonationInfo: async function () {
    const contractInstance = await App.contracts.fundForFloodVictims.deployed();

    const result = await contractInstance.getDonationInfo({
      from: App.account[0],
    });
    const printDiv = $("#donationInfo");

    if (result) {
      printDiv.append(
        "<p> <strong>Sylhet</strong> account has <strong>" +
          result[0]["c"] / 10000 +
          " ETH</strong> </p>"
      );
      printDiv.append(
        "<p> <strong>Chittagong South</strong> account has <strong>" +
          String(result[1]["c"] / 10000) +
          " ETH</strong> </p>"
      );
      printDiv.append(
        "<p> <strong>Chittagong North</strong> account has <strong>" +
          String(result[2]["c"] / 10000) +
          " ETH</strong> </p>"
      );
      printDiv.append(
        "<p> <strong>Total balance</strong> is <strong>" +
          String(result[3]["c"] / 10000) +
          " ETH</strong> </p>"
      );

      const balanceCheckerButton = $("#checkBalanceButton");
      balanceCheckerButton.hide();
    } else {
      printDiv.append(
        "<p> Failed to show the donation information. Please try again. </p>"
      );
    }
  },

  // donor er info show kore
  getDonorInfo: async function () {
    const contractInstance = await App.contracts.fundForFloodVictims.deployed();

    // fetching input
    const account = document.getElementById("userAccount").value;

    const printDiv = $("#donorsInfo");
    printDiv.empty();

    try {
      const result = await contractInstance.getDonorInfo(account, {
        from: App.account[0],
      });

      if (result) {
        printDiv.append("<p> <strong>Address: </strong>" + account + " </p>");
        printDiv.append("<p> <strong>Name: </strong>" + result[0] + " </p>");
        printDiv.append(
          "<p> <strong>Phone number: </strong>" + result[1] + " </p>"
        );

        const checkerElemnts = $("#checkerElemnts");
        checkerElemnts.hide();
      } else {
        printDiv.append("<p> Please try again. </p>");
      }
    } catch {
      printDiv.append(
        "<p> Failed to show the donors information. Please try again. </p>"
      );
    }
  },

  // event listener
  listenForEvents: async function () {
    const contractInstance = await App.contracts.fundForFloodVictims.deployed();

    contractInstance
      .occurEvent(
        {},
        {
          fromBlock: 0,
          toBlock: "latests",
        }
      )
      .watch(function (err, event) {
        // reload page
        App.render();
      });
  },

  // navigation control
  clickNav: async function (page) {
    const b0 = document.getElementById("b0");
    const b1 = document.getElementById("b1");
    const b2 = document.getElementById("b2");
    const b3 = document.getElementById("b3");
    b0.setAttribute("style", "font-weight: normal;");
    b1.setAttribute("style", "font-weight: normal;");
    b2.setAttribute("style", "font-weight: normal;");
    b3.setAttribute("style", "font-weight: normal;");

    const s0 = $("#s0");
    const s1 = $("#s1");
    const s2 = $("#s2");
    const s3 = $("#s3");
    s0.hide();
    s1.hide();
    s2.hide();
    s3.hide();

    if (page == 0) {
      b0.setAttribute("style", "font-weight: bold;");
      s0.show();
    } else if (page == 1) {
      b1.setAttribute("style", "font-weight: bold;");
      s1.show();
    } else if (page == 2) {
      b2.setAttribute("style", "font-weight: bold;");
      s2.show();
    } else if (page == 3) {
      b3.setAttribute("style", "font-weight: bold;");
      s3.show();
    }
  },
};

$(function () {
  $(window).load(function () {
    App.initWeb();
  });
});
