(async () => {
  function createService(channelName, service, channels) {
    return `<td>${channels.includes(channelName) ? '✅': '🛑'}</td>`;
  }

  function createRow(channelName, services) {
    return `<tr>
      <td>${channelName}</td>
      ${Object.entries(services).map(([service, channels]) => createService(channelName, service, channels)).join("\n")}
    </tr>`
  }

  try {
    const table = document.querySelector('table#channels');
    const res = await fetch("/service-channel-names.json");
    const json = await res.json();

    const headers = [
      `<th>Channel Name</th>`,
      ...Object.keys(json).map(k => `<th>${k}</th>`)
    ];
    table.querySelector('thead').innerHTML = `<tr>${headers.join("\n")}</tr>`;

    const channelNames = Array.from(new Set(Object.values(json).flatMap(channels => channels)));

    table.querySelector('tbody').innerHTML = channelNames.map(channelName => createRow(channelName, json)).join("\n");
    
  } catch (e) {
    console.log(e);
  }
})();