let ls = window.localStorage;
var pieChart;
var dailyChart;
var monthlyChart;
var weeklyChart;
let username = ls.getItem("loggedInUser").toString()

//set min dan max tanggal yang bisa diinput
let minDate = new Date(2020, 0, 1); //min date = 01-01-2023
let minDateString = minDate.toLocaleDateString("en-CA"); //agar formatnya jadi YYYY-MM-DD
let maxDate = new Date(); //max date = hari ini
let maxDateString = maxDate.toLocaleDateString("en-CA"); //agar formatnya jadi YYYY-MM-DD

//set min dan max tahun yang bisa diinput
document.getElementById("dailyGraphYear").value = maxDate.getFullYear();
document.getElementById("dailyGraphYear").setAttribute("min", 2020);
document
  .getElementById("dailyGraphYear")
  .setAttribute("max", maxDate.getFullYear());

document.getElementById("weeklyGraphYear").value = maxDate.getFullYear();
document.getElementById("weeklyGraphYear").setAttribute("min", 2020);
document
  .getElementById("monthlyGraphYear")
  .setAttribute("max", maxDate.getFullYear());

document.getElementById("monthlyGraphYear").value = maxDate.getFullYear();
document.getElementById("monthlyGraphYear").setAttribute("min", 2020);
document
  .getElementById("monthlyGraphYear")
  .setAttribute("max", maxDate.getFullYear());

document.getElementById("pieGraphYear").value = maxDate.getFullYear();
document.getElementById("pieGraphYear").setAttribute("min", 2020);
document
  .getElementById("pieGraphYear")
  .setAttribute("max", maxDate.getFullYear());

//function untuk mengambil nilai dari local storage
function getLocalStorageData(sorted) {
  //ambil data array dari local storage yang fieldnya namanya income dan outcome
  var dailyArrayIncome = ls.getItem("income"+username);
  var dailyArrayOutcome = ls.getItem("outcome"+username);

  //parsing dari local storage, asalnya String jadi menjadi type
  if (dailyArrayIncome && dailyArrayIncome.length > 0) {
    dailyArrayIncome = JSON.parse(dailyArrayIncome);
  } else {
    dailyArrayIncome = [];
  }
  if (dailyArrayOutcome && dailyArrayOutcome.length > 0) {
    dailyArrayOutcome = JSON.parse(dailyArrayOutcome);
  } else {
    dailyArrayOutcome = [];
  }

  //jika parameternya true, maka akan di sort
  if (sorted == true) {
    //sorting array sesuai tanggal (ascending)
    dailyArrayIncome.sort(function (a, b) {
      return new Date(a.date) - new Date(b.date);
    });
    dailyArrayOutcome.sort(function (a, b) {
      return new Date(a.date) - new Date(b.date);
    });
  }

  return { dailyArrayIncome, dailyArrayOutcome };
}

//function dibawah ini untuk menampilkan chart pengeluaran berdasarkan category per bulan, dibuat menjadi pie chart
function expenseGraph() {
  //mengambil value bulan dan tahun yang dipilih dari input type dropdown
  var selectedMonth = document.getElementById("pieGraphMonthDropdown").value;
  var selectedYear = document.getElementById("pieGraphYear").value;
  //array dengan isi setiap bulan
  const month = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  //array pengeluaran per hari
  const expenseDaily = [];
  //nilai untuk sumbu x di chart nanti, sumbu x ini adalah keterangan dari per bagian pie chartnya
  const xValues = [
    "Gadget",
    "Hiburan",
    "Kesehatan",
    "Makanan & Minuman",
    "Pendidikan",
    "Transportasi",
  ];
  //array nilai untuk total per kategori dalam 1 bulan
  const yValues = [];
  //array untuk warna masing masing category
  var barColors = [
    "#b91d47",
    "#00aba9",
    "#2b5797",
    "#e8c3b9",
    "#1e7145",
    "orange",
  ];
  const totalExpenseCat = new Array(6).fill(0); // Pembuatan array total income per bulan dengan size 12 dan isi dengan 0

  // Menghapus chart sebelumnya apabila sudah ada (untuk prevent duplikasi chart)
  if (pieChart) {
    pieChart.destroy();
  }

  //pengambilan value dari local storage dengan key transaction untuk mengambil semua transaksi
  var transactionArray = ls.getItem("transaction"+username);

  //parsing dari local storage, asalnya String jadi menjadi type
  if (transactionArray && transactionArray.length > 0) {
    transactionArray = JSON.parse(transactionArray);
  } else {
    transactionArray = [];
  }

  //sortir array berdasarkan kategori
  transactionArray.sort(function (a, b) {
    return a.category.localeCompare(b.category);
  });

  //filter isi array berdasarkan type outcome saja, lalu diinput ke array baru
  for (let index = 0; index < transactionArray.length; index++) {
    if (transactionArray[index].type == "outcome") {
      expenseDaily.push(transactionArray[index]);
    }
  }

  //index untuk pengecekan array xValues
  let idx = 0;
  //for loop untuk penambahan jumlah pengeluaran per kategori dalam 1 bulan
  for (let index = 0; index < expenseDaily.length; index++) {
    let date = new Date(expenseDaily[index].date); //pembuatan objek date dari field array

    //kondisi penambahan ke array dengan index idx apabila bulan dan kategori sama
    if (
      date.getMonth() + 1 == selectedMonth &&
      expenseDaily[index].category == xValues[idx] &&
      selectedYear == date.getFullYear()
    ) {
      totalExpenseCat[idx] += expenseDaily[index].amount;
    } else if (selectedYear == date.getFullYear()) {
      //kondisi apabila kategori / bulan sudah berbeda
      idx = xValues.indexOf(expenseDaily[index].category);
      if (idx !== -1 && date.getMonth() + 1 == selectedMonth) {
        totalExpenseCat[idx] += expenseDaily[index].amount;
      }
    }
  }

  //memasukkan value hasil penambahan tadi ke yValue
  for (let index = 0; index < totalExpenseCat.length; index++) {
    yValues.push(totalExpenseCat[index]);
  }

  //pembuatan pieChart untuk menampilkan pengeluaran per kategori dalam 1 bulan
  pieChart = new Chart("pieChart", {
    type: "pie", //jenis chart
    data: {
      labels: xValues, //informasi per kategori
      datasets: [
        {
          backgroundColor: barColors, //warna tiap kategori
          data: yValues, //jumlah pengeluaran tiap kategori
        },
      ],
    },
    options: {
      title: {
        display: true,
        text:
          "Pengeluaran Berdasarkan Kategori di Bulan " +
          month[selectedMonth - 1] +
          " Tahun " +
          selectedYear,
      },
    },
  });
}

//function untuk menampilkan chart setiap hari dalam 1 bulan
function dailyGraph() {
  const namaBulan = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  //deklarasi array sebagai value dari sumbu x dan y dari graph nya
  const xValues = [];
  const yValuesIncome = [];
  const yValuesOutcome = [];

  // Menghapus chart sebelumnya apabila sudah ada (untuk prevent duplikasi chart)
  if (dailyChart) {
    dailyChart.destroy();
  }

  //ambil value dari input
  var selectedMonth = document.getElementById("dailyGraphMonthDropdown").value;
  var selectedYear = document.getElementById("dailyGraphYear").value;

  //memanggil function getLocalStorageData untuk mendapatkan data dari local storage
  var { dailyArrayIncome, dailyArrayOutcome } = getLocalStorageData(true);

  // Ambil objek incomeTable
  var table = document.getElementById("dailyTable");

  // menghapus table jika sudah ada agar tidak terjadi duplikasi / append
  //   for (let i = table.rows.length - 1; i > 0; i--) {
  //     table.deleteRow(i);
  //   }

  // mengkombinasikan array income dan outcome menjadi 1 array, lalu kemudian di sort berdasarkan date
  var combinedArray = [...dailyArrayIncome, ...dailyArrayOutcome];
  combinedArray.sort(function (a, b) {
    return new Date(a.date) - new Date(b.date);
  });

  // Membuat sebuah array yang merupakan unique dates, sehingga tidak ada duplikasi date dari income dan outcome
  var uniqueDates = [];
  combinedArray.forEach(function (item) {
    var dateStr = new Date(item.date).toDateString();
    //pengecekan apakah date per item sudah ada di array uniqueDates, jika belum maka masukkan date tersebut
    if (!uniqueDates.includes(dateStr)) {
      uniqueDates.push(dateStr);
    }
  });

  //memasukkan data ke array xValues dan yValues untuk graph
  for (let index = 0; index < uniqueDates.length; index++) {
    var date = new Date(uniqueDates[index]);

    // hanya memproses apabila date month nya ini sama dengan month yang dipilih di dropdown
    if (
      date.getMonth() + 1 == selectedMonth &&
      date.getFullYear() == selectedYear
    ) {
      //push tanggal ke array untuk value di sumbu x
      xValues.push(
        date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear()
      );

      // mencari income dari date ini, dilakukan pengecekan
      let incomeObj = dailyArrayIncome.find(function (element) {
        return new Date(element.date).toDateString() === date.toDateString();
      });
      //apabila income dengan date ini ditemukan, maka dipush ke array yValuesIncome, kalau tidak ada, push value 0
      yValuesIncome.push(incomeObj ? incomeObj.income : 0);

      // mencari outcome dari date ini, dilakukan pengecekan
      let outcomeObj = dailyArrayOutcome.find(function (element) {
        return new Date(element.date).toDateString() === date.toDateString();
      });
      //apabila income dengan date ini ditemukan, maka dipush ke array yValuesIncome, kalau tidak ada, push value 0
      yValuesOutcome.push(outcomeObj ? outcomeObj.outcome : 0);

      //var total = income - outcome
      let total =
        yValuesIncome[yValuesIncome.length - 1] -
        yValuesOutcome[yValuesOutcome.length - 1];

      //   // membuat baris baru di posisi paling akhir
      //   var row = table.insertRow(-1);

      //   // membuat column baru di row yang baru dibuat
      //   var cell1 = row.insertCell(0);
      //   var cell2 = row.insertCell(1);
      //   var cell3 = row.insertCell(2);
      //   var cell4 = row.insertCell(3);

      //   // Memasukkan data ke table yang baru
      //   cell1.innerHTML = xValues[xValues.length - 1]; //date
      //   cell2.innerHTML = yValuesIncome[yValuesIncome.length - 1]; //income
      //   cell3.innerHTML = yValuesOutcome[yValuesOutcome.length - 1]; // outcome
      //   cell4.innerHTML = total; //data total (income-outcome)
      //   if (total < 0) {
      //     cell4.style.backgroundColor = "red";
      //   } else if (total > 0) {
      //     cell4.style.backgroundColor = "green";
      //   }
    }
  }

  //pembuatan chart sesuai dengan data yang sudah ada
  dailyChart = new Chart("dailyChart", {
    type: "line", //tipe chartnya
    data: {
      labels: xValues, //array buat nilai x berupa date
      datasets: [
        {
          label: "Income Per Hari",
          borderColor: "green",
          data: yValuesIncome, //array buat nilai y  untuk income
        },
        {
          label: "Outcome Per Hari",
          borderColor: "red",
          data: yValuesOutcome, //array buat nilai y untuk outcome
        },
      ],
    },
    options: {
      title: {
        display: true,
        text:
          "Income and Outcome Per Hari Di Bulan " +
          namaBulan[selectedMonth - 1] +
          " Di Tahun " +
          selectedYear,
        fontSize: 16,
        fontColor: "black",
      },
    },
  });
}

//function untuk menampilkan chart berdasarkan 12 bulan dalam 1 tahun
function monthlyGraph() {
  //deklarasi array untuk value y graphic nya, dan untuk table juga
  const yValuesIncome = [];
  const yValuesOutcome = [];
  //array untuk menampung jumlah per bulan
  const totalPerBulanIncome = new Array(12).fill(0); // Pembuatan array total income per bulan dengan size 12 dan isi dengan 0
  const totalPerBulanOutcome = new Array(12).fill(0); // Pembuatan array total outcome per bulan dengan size 12 dan isi dengan 0
  //deklarasi array dengan isi nama per bulan, untuk value dari sumbu x graph ini
  const xValues = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  //mengambil tahun dari input
  var selectedYear = document.getElementById("monthlyGraphYear").value;

  // Menghapus chart sebelumnya apabila sudah ada (untuk prevent duplikasi chart)
  if (monthlyChart) {
    monthlyChart.destroy();
  }

  //memanggil function getLocalStorageData untuk mendapatkan data dari local storage
  var { dailyArrayIncome, dailyArrayOutcome } = getLocalStorageData(true);

  //Ambil elemen table untuk table bulanan
  //   var table = document.getElementById("monthlyTable");

  // Pembersihan table agar tidak append
  //   for (let i = table.rows.length - 1; i > 0; i--) {
  //     table.deleteRow(i);
  //   }

  //Pengisian array total income per bulan
  var idx = 0;
  for (let i = 0; i < dailyArrayIncome.length; i++) {
    let dateTemp = new Date(dailyArrayIncome[i].date);
    //pengecekan apakah bulan masih sama dengan idx atau tidak
    if (idx === dateTemp.getMonth() && selectedYear == dateTemp.getFullYear()) {
      totalPerBulanIncome[idx] =
        totalPerBulanIncome[idx] + dailyArrayIncome[i].income;
    } else if (selectedYear == dateTemp.getFullYear()) {
      //kondisi apabila bulan sudah berbeda tapi tahun sama
      idx = xValues.indexOf(xValues[dateTemp.getMonth()]);
      if (idx !== -1 && dateTemp.getMonth() + 1 === idx + 1) {
        totalPerBulanIncome[idx] =
          totalPerBulanIncome[idx] + dailyArrayIncome[i].income;
      }
    }
  }

  //Pengisian array total outcome per bulan
  idx = 0;
  for (let i = 0; i < dailyArrayOutcome.length; i++) {
    let dateTemp = new Date(dailyArrayOutcome[i].date);
    //pengecekan apakah bulan masih sama dengan idx atau tidak
    if (idx === dateTemp.getMonth() && selectedYear == dateTemp.getFullYear()) {
      totalPerBulanOutcome[idx] =
        totalPerBulanOutcome[idx] + dailyArrayOutcome[i].outcome;
    } else if (selectedYear == dateTemp.getFullYear()) {
      //kalau tidak, nambah index dan assign bulan baru
      //kondisi apabila bulan sudah berbeda tapi tahun sama
      idx = xValues.indexOf(xValues[dateTemp.getMonth()]);
      if (idx !== -1 && dateTemp.getMonth() + 1 === idx + 1) {
        totalPerBulanOutcome[idx] =
          totalPerBulanOutcome[idx] + dailyArrayOutcome[i].outcome;
      }
    }
  }

  //   pembuatan chart dan table sesuai data total income dan outcome per bulan
  for (let index = 0; index < totalPerBulanIncome.length; index++) {
    yValuesIncome[index] = totalPerBulanIncome[index];
    yValuesOutcome[index] = totalPerBulanOutcome[index];

    //deklarasi var total = total income - total outcome
    let total = yValuesIncome[index] - yValuesOutcome[index];

    // Membuat baris baru di posisi paling akhir
    //   var row = table.insertRow(-1);

    // membuat column baru di row yang baru dibuat
    //   var cell1 = row.insertCell(0);
    //   var cell2 = row.insertCell(1);
    //   var cell3 = row.insertCell(2);
    //   var cell4 = row.insertCell(3);

    // Memasukkan data ke table
    //   cell1.innerHTML = xValues[index]; //data date
    //   cell2.innerHTML = yValuesIncome[index]; //data income
    //   cell3.innerHTML = yValuesOutcome[index]; //data outcome
    //   cell4.innerHTML = total; //data total (income-outcome)
    //   if (total < 0) {
    //     cell4.style.backgroundColor = "red";
    //   } else if (total > 0) {
    //     cell4.style.backgroundColor = "green";
    //   }
  }

  //pembuatan chart
  monthlyChart = new Chart("monthlyChart", {
    type: "bar", //tipe chartnya
    data: {
      labels: xValues, //array buat nilai x
      datasets: [
        {
          label: "Income Per Bulan",
          backgroundColor: "green",
          data: yValuesIncome, //array buat nilai y income
        },
        {
          label: "Outcome Per Bulan",
          backgroundColor: "red",
          data: yValuesOutcome, //array buat nilai y outcome
        },
      ],
    },
    options: {
      title: {
        display: true,
        text: "Income and Outcome Per Bulan di Tahun " + selectedYear,
        fontSize: 16,
        fontColor: "black",
      },
    },
  });
}

function weeklyGraph() {
  //mengambil year dari form weekly
  var selectedYear = document.getElementById("weeklyGraphYear").value;

  //deklarasi array untuk value y graphic nya, dan untuk table juga
  const yValuesIncome = [];
  const yValuesOutcome = [];
  const xValues = [];

  const totalPerMingguIncome = new Array().fill(0);
  const totalPerMingguOutcome = new Array().fill(0);

  // tableWeekly.clear();

  //memanggil function getLocalStorageData untuk mendapatkan data dari local storage
  var { dailyArrayIncome, dailyArrayOutcome } = getLocalStorageData(true);

  //membuat array baru untuk menampung data yang tahunnya sama
  var incomeArrayThisYear = [];
  var outcomeArrayThisYear = [];

  //memasukkan data ke array baru agar tahunnya sama dengan yang dipilih
  for (let index = 0; index < dailyArrayIncome.length; index++) {
    let date = new Date(dailyArrayIncome[index].date);
    if (date.getFullYear() == selectedYear) {
      incomeArrayThisYear.push(dailyArrayIncome[index]);
    }
  }

  //memasukkan data ke array baru agar tahunnya sama dengan yang dipilih
  for (let index = 0; index < dailyArrayOutcome.length; index++) {
    let date = new Date(dailyArrayOutcome[index].date);
    if (date.getFullYear() == selectedYear) {
      outcomeArrayThisYear.push(dailyArrayOutcome[index]);
    }
  }

  var mingguKe = 1;
  var incomeIdx = 0;
  var outcomeIdx = 0;
  var weeklyIncome = 0;
  var weeklyOutcome = 0;

  var date = new Date(selectedYear, 0, 1);
  var firstDay =
    date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
  var lastDay;

  if (
    incomeArrayThisYear &&
    incomeIdx < incomeArrayThisYear.length &&
    outcomeArrayThisYear &&
    outcomeIdx < outcomeArrayThisYear.length
  ) {
    while (date.getFullYear() == selectedYear) {
      if (incomeArrayThisYear && incomeIdx < incomeArrayThisYear.length) {
        var incomeDate = new Date(incomeArrayThisYear[incomeIdx].date);
      }
      if (outcomeArrayThisYear && outcomeIdx < outcomeArrayThisYear.length) {
        var outcomeDate = new Date(outcomeArrayThisYear[outcomeIdx].date);
      }

      // Initialize weeklyIncome and weeklyOutcome to 0 at the start of each week
      if (date.getDay() == 1) {
        weeklyIncome = 0;
        weeklyOutcome = 0;
        var firstDay =
          date.getDate() +
          "/" +
          (date.getMonth() + 1) +
          "/" +
          date.getFullYear();
      }

      if (
        date.getDate() == incomeDate.getDate() &&
        date.getMonth() == incomeDate.getMonth()
      ) {
        weeklyIncome = incomeArrayThisYear[incomeIdx].income;
        if (incomeIdx < incomeArrayThisYear.length - 1) {
          incomeIdx++;
        }
      }
      if (
        date.getDate() == outcomeDate.getDate() &&
        date.getMonth() == outcomeDate.getMonth()
      ) {
        weeklyOutcome = outcomeArrayThisYear[outcomeIdx].outcome;
        if (outcomeIdx < outcomeArrayThisYear.length - 1) {
          outcomeIdx++;
        }
      }

      if (date.getDay() == 0) {
        yValuesIncome.push(weeklyIncome);
        yValuesOutcome.push(weeklyOutcome);
        xValues.push(mingguKe);
        let total = weeklyIncome - weeklyOutcome;
        lastDay =
          date.getDate() +
          "/" +
          (date.getMonth() + 1) +
          "/" +
          date.getFullYear();

        var row = [
          mingguKe,
          firstDay + " - " + lastDay,
          weeklyIncome,
          weeklyOutcome,
          total,
        ];
        // tableWeekly.row.add(row);
        mingguKe++;
        weeklyIncome = 0;
        weeklyOutcome = 0;
      }
      date.setDate(date.getDate() + 1);
    }
  }

  // tableWeekly.draw();

  //pembuatan chart sesuai dengan data yang sudah ada
  weeklyChart = new Chart("weeklyChart", {
    type: "line", //tipe chartnya
    data: {
      labels: xValues, //array buat nilai x berupa date
      datasets: [
        {
          label: "Income Per Week",
          borderColor: "green",
          data: yValuesIncome, //array buat nilai y  untuk income
        },
        {
          label: "Outcome Per Week",
          borderColor: "red",
          data: yValuesOutcome, //array buat nilai y untuk outcome
        },
      ],
    },
    options: {
      title: {
        display: true,
        text: "Income and Outcome Per Week in " + selectedYear,
        fontSize: 16,
        fontColor: "black",
      },
    },
  });
}
