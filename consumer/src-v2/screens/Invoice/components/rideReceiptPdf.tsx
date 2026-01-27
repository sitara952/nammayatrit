import { pdfProps } from '../Types';

export const rideReceiptPdf = ({
    sourceDate,
    finalAmount,
    htmlFares,
    rideShortId,
    driverName,
    userName,
    license,
    sourceTime,
    sourceAddress,
    destinationTime,
    destinationAddress,
    extraInfo,
    stopsInfo,
    height,
    appLogoImage,
}: pdfProps) => {
    return `
  <style>
    @media print {
        div {
            -webkit-print-color-adjust: exact !important;
        }
    }
  </style>
  <div style="padding:30px;">
  <!-- logo -->
  <div style="display: flex; align-items: center; margin-bottom: 20px;">
    <img src="${appLogoImage}" alt="App Logo" style="width: 120px; height: auto;" />
  </div>
  <!-- logo ends -->
  <!-- title -->
  <div style="font-weight: 700; font-size: 20px; line-height: 28px; color:#5B6777; display: block;">
    Hi ${userName}! Here is your driver receipt.
  </div>
  <!-- Header -->
  <div style="height: 63px; display:flex; flex-direction: row; align-items: center;">
    <br>
    <!-- title ends -->

    <!-- date and time -->
    <div style="font-weight: 700; font-size: 16px; line-height: 24px; color:#5B6777;">
      ${sourceDate}
    </div>
    <!-- date and time ends -->
  </div>
  <!-- Header ends -->

  <!-- line below header -->
  <div style="height: 1px; flex-grow:1; border-bottom:solid 1px; border-color:#E0E3E8; margin-top:20px; margin-bottom:40px;"></div>

  <!-- Invoice info -->
  <div style="display:flex; gap:46px; flex-direction: column; background-color: #D1D5DB;">

    <!-- details -->
    <div style="display: flex; flex-direction: column; gap:48px;">
      <!-- fare deatils -->
      <div style="display: flex; flex-direction: column; gap:24px;">
        <!-- main fare -->
        <div style="display: flex; flex-direction: row;">
          <div style="font-weight: 800; font-size: 20px; line-height: 26px; color:#498526; flex-grow:1; padding:20px 0px 0px 15px; ">Payment Details</div>
          <div style="font-weight: 800; font-size: 20px; line-height: 26px; color:#498526; padding:20px 15px 0px 0px; ">${finalAmount}</div>
        </div>
        <!-- main fare ends -->
        <!-- fare details card-->
        <div style="padding:40px 24px 40px 24px; background-color: #F0F0F0; display:flex; flex-direction: column; gap:32px; border:solid 2px #F1F2F7; border-radius:8px;">
          <!-- all fare types -->
          <div style="display: flex; flex-direction: column; gap:20px;">
            ${htmlFares}
          </div>
          <!-- all fare types ends -->
          <!-- line below all fare types -->
          <div style="height: 1px; flex-grow:1; border-bottom:solid 1px; border-color:#E0E3E8;"></div>
          <!-- Final amount -->
          <div style="display: flex; flex-direction: row; ">
            <div style="font-weight: 700; font-size: 16px; line-height: 22px; color:#454545; flex-grow:1;">Final Amount Paid</div>
            <div style="font-weight: 700; font-size: 16px; line-height: 22px; color:#454545;">${finalAmount}</div>
          </div>
          <!-- Final amount ends -->
        </div>
        <!-- fare details cards ends -->
      </div>
      <!-- fare details ends-->

      <!-- Ride Info -->
      <div style="display: flex; flex-direction: column; gap:24px;">
        <!-- Ride ID -->
        <div style="display: flex; flex-direction: row;">
          <div style="font-weight: 800; font-size: 20px; line-height: 26px; color:#498526; flex-grow:1; padding:0px 0px 15px 20px;">Ride Details</div>
          <div style="font-weight: 800; font-size: 20px; line-height: 26px; color:#498526; padding:0px 20px 15px 0px;">RideID: ${rideShortId}</div>
        </div>
        <!-- Ride ID ends -->
        <!-- Ride Info Card -->
        <div style="padding:40px 24px 40px 24px; background-color: #F0F0F0; display:flex; flex-direction: column; gap:32px; border:solid 2px #F1F2F7; border-radius:8px;">
          <!-- driver info -->
          <div style="display: flex; flex-direction: column; gap:20px;">
            <div style="display: flex; flex-direction: row; ">
              <div style="font-weight: 700; font-size: 16px; line-height: 22px; color:#6D7280; flex-grow:1;">Driver Name</div>
              <div style="font-weight: 700; font-size: 16px; line-height: 22px; color:#6D7280;">${driverName}</div>
            </div>
            <div style="display: flex; flex-direction: row; ">
              <div style="font-weight: 700; font-size: 16px; line-height: 22px; color:#6D7280; flex-grow:1;">License Plate</div>
              <div style="font-weight: 700; font-size: 16px; line-height: 22px; color:#6D7280;">${license}</div>
            </div>
          </div>
          <!-- driver info ends -->
          <!-- line below driver -->
          <div style="height: 1px; flex-grow:1; border-bottom:solid 1px; border-color:#E0E3E8;"></div>

          <!-- FromTo -->
          <div style="display: flex; flex-direction: row; gap:8px; ">
            <!-- dots -->
            <div style="width: 24px; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 8px; padding-top: 6px; padding-bottom: 22px;">
            <div style="width: 16px; height: 16px; background-color: #4CAF50; border-radius: 50%; box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);"></div>
            ${
                destinationAddress && destinationTime
                    ? `<div style="width: 1px; height: ${height}px; border-left: 2px #B9BABE dotted; margin-left: 1px;"></div>
            <div style="width: 16px; height: 16px; background-color: #F88080; border-radius: 50%; box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);"></div>`
                    : ''
            }
            </div>
            <!-- dots ends -->
            <!-- source and dest -->
            <div style="display: flex; flex-direction: column; gap:35px">
              <!-- source info -->
              <div style="display: flex; flex-direction: column; gap:8px;">
                <div style="font-weight: 800; font-size: 16px; line-height: 24px; color:#454545;">${sourceTime}</div>
                <div style="font-weight: 600; font-size: 16px; line-height: 22px; color:#6D7280;">${sourceAddress}</div>
              </div>
              <!-- source info ends -->
              <!-- stops info 1 starts -->
              ${
                  stopsInfo && stopsInfo[0]
                      ? `
              <div style="display: flex; flex-direction: column; gap:8px; ">
                <div style="font-weight: 800; font-size: 16px; line-height: 24px; color:#454545;">${stopsInfo[0].stopsTime}</div>
                <div style="font-weight: 600; font-size: 16px; line-height: 22px; color:#6D7280;">${stopsInfo[0].stopsLocation}</div>
              </div>
              `
                      : ''
              }
              <!-- stops info 1 ends -->
              <!-- stops info 2 starts -->
              ${
                  stopsInfo && stopsInfo[1]
                      ? `
            <div style="display: flex; flex-direction: column; gap:8px; ">
              <div style="font-weight: 800; font-size: 16px; line-height: 24px; color:#454545;">${stopsInfo[1].stopsTime}</div>
              <div style="font-weight: 600; font-size: 16px; line-height: 22px; color:#6D7280;">${stopsInfo[1].stopsLocation}</div>
            </div>
            `
                      : ''
              }
              <!-- stops info 2 ends -->
              <!-- dest info -->
              ${
                  destinationAddress && destinationTime
                      ? `<div style="display: flex; flex-direction: column; gap:8px; ">
                <div style="font-weight: 800; font-size: 16px; line-height: 24px; color:#454545;">${destinationTime}</div>
                <div style="font-weight: 600; font-size: 16px; line-height: 22px; color:#6D7280;">${destinationAddress}</div>
              </div>`
                      : ''
              }
              <!-- dest info ends -->
            </div>
            <!-- source and dest ends -->
          </div>
          <!-- FromTo ends -->
        </div>
        <!-- Ride Info Card ends -->

      </div>
      <!-- Ride Info ends -->
    </div>
    <!-- details ends -->

  </div>
  <!-- Invoice Info -->

  <!-- Extra Info -->
  <div style="display: flex; flex-direction: column; padding-top: 12px; padding-bottom: 16px; gap:12px; margin-top: 40px;">
    ${extraInfo}
  </div>
  <!-- Extra Info ends -->
</div>`;
};
