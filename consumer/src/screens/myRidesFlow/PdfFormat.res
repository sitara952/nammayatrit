let pdf = (
  rideDetail: MyRidesScreenType.rideDetail,
  userName: string,
  waitingChargesPresent: bool,
  customerTipPresent: bool,
  htmlFares: string,
) => {
  let showWaitingInfo = waitingChargesPresent ? "" : "display:none;"
  let showTipInfo = customerTipPresent ? "" : "display:none;"
  let date = {
    DateAndTimeHelpers.getISTWithFormat(
      rideDetail.rideStartTime->Option.getOr(rideDetail.createdAt),
      "ddd, Do MMM, YYYY",
    )
  }
  let license = rideDetail.vehicleNumber
  let currency = rideDetail.currency
  let finalAmount = currency ++ rideDetail.computedPrice->Option.getOr(0)->Int.toString
  let rideId = rideDetail.shortRideId
  let driverName = rideDetail.driverName
  let sourceAddress = rideDetail.sourceLocationInfo.address
  let destinationAddress = rideDetail.destinationLocationInfo.address
  let sourceTime = DateAndTimeHelpers.getISTWithFormat(
    rideDetail.rideStartTime->Option.getOr(""),
    "hh:mm A",
  )
  let destinationTime = DateAndTimeHelpers.getISTWithFormat(
    rideDetail.rideEndTime->Option.getOr(""),
    "hh:mm A",
  )

  `<style>
    @media print {
        div {
            -webkit-print-color-adjust: exact !important;
        }
    }
  </style>
  <div style="padding:30px;">
    <!-- Header -->
    <div style="height: 63px; display:flex; flex-direction: row; align-items: center;">
      <div class="svg" style="flex-grow:1;">
        <!-- SVG for LOGO -->
        <svg width="148" height="43" viewBox="0 0 148 43" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clip-path="url(#clip0_7820_6414)">
            <path
              d="M31.4253 0H11.5965C5.19193 0 0 5.18931 0 11.5906V31.4094C0 37.8107 5.19193 43 11.5965 43H31.4253C37.8298 43 43.0218 37.8107 43.0218 31.4094V11.5906C43.0218 5.18931 37.8298 0 31.4253 0Z"
              fill="url(#paint0_linear_7820_6414)" />
            <path d="M14.0556 18.5898H7.95166V34.1139H14.0556V18.5898Z" fill="white" />
            <path d="M35.3427 18.5898H29.2388V34.1139H35.3427V18.5898Z" fill="white" />
            <path
              d="M21.6453 32.2785C14.0957 32.2785 7.95166 26.1375 7.95166 18.5918H14.0556C14.0556 22.775 17.46 26.1821 21.6497 26.1821C25.8395 26.1821 29.2439 22.7794 29.2439 18.5918H35.3478C35.3478 26.1375 29.2037 32.2785 21.6542 32.2785H21.6453Z"
              fill="white" />
            <path
              d="M10.9718 16.1757C12.9851 16.1757 14.6172 14.5445 14.6172 12.5322C14.6172 10.5199 12.9851 8.88867 10.9718 8.88867C8.95851 8.88867 7.32642 10.5199 7.32642 12.5322C7.32642 14.5445 8.95851 16.1757 10.9718 16.1757Z"
              fill="white" />
            <path
              d="M32.0499 16.1757C34.0632 16.1757 35.6953 14.5445 35.6953 12.5322C35.6953 10.5199 34.0632 8.88867 32.0499 8.88867C30.0366 8.88867 28.4045 10.5199 28.4045 12.5322C28.4045 14.5445 30.0366 16.1757 32.0499 16.1757Z"
              fill="white" />
            <path
              d="M60.9144 34.2017C58.5184 34.2017 56.4882 33.2786 55.3371 31.6642L55.0649 31.2851L55.0827 33.7067L50.5271 33.7379L50.3486 9.21872L55.0827 9.1875L55.1497 17.3353L55.4084 17.0008C56.5909 15.489 58.5184 14.6461 60.8431 14.6283H60.8966C65.5771 14.6283 68.9994 18.7267 69.0396 24.3771C69.0797 30.0364 65.6887 34.166 60.9769 34.1972H60.91L60.9144 34.2017ZM59.6963 18.7713C58.3533 18.7802 57.22 19.3332 56.4079 20.3679C55.6048 21.3936 55.1898 22.8117 55.1987 24.4752C55.221 27.9359 56.9612 30.081 59.7365 30.081C61.1286 30.0721 62.2664 29.528 63.0562 28.5156C63.837 27.5122 64.243 26.0941 64.2341 24.4128C64.2118 20.9298 62.485 18.7668 59.732 18.7668H59.6963V18.7713Z"
              fill="black" />
            <path
              d="M86.1506 17.4734C84.5533 17.4734 83.2415 16.189 83.2281 14.6103C83.2191 13.0182 84.5176 11.716 86.1283 11.707C87.7703 11.707 89.0955 12.9914 89.1044 14.5701C89.1133 16.1355 87.7703 17.4644 86.1685 17.4734H86.1462H86.1506Z"
              fill="black" />
            <path
              d="M98.6398 33.9433C93.3123 33.9433 90.4924 29.06 90.4611 24.2347C90.4388 21.2735 91.2866 18.7538 92.9107 16.9476C94.3876 15.3064 96.391 14.3922 98.5595 14.3744H98.6264C100.915 14.3744 102.834 15.2039 104.025 16.7068L104.293 17.0412L104.226 9.23239L108.96 9.20117L109.139 33.3368L104.583 33.368L104.565 31.0044L104.302 31.3612C103.093 33.0113 101.098 33.9255 98.6934 33.9433H98.6398ZM99.7642 18.4951C98.4792 18.504 97.3815 18.9901 96.5873 19.8999C95.7128 20.8988 95.2577 22.3884 95.2666 24.199C95.2934 28.3331 97.6314 29.8048 99.8088 29.8048C102.098 29.7914 104.364 28.0298 104.338 24.1366C104.311 19.9757 101.973 18.4951 99.7999 18.4951H99.7642Z"
              fill="black" />
            <path
              d="M119.588 40.5759C114.337 40.5759 111.062 38.6984 111.039 35.6836C111.03 34.3814 111.82 32.8741 113.101 31.7502L113.248 31.6209L113.083 31.5139C111.829 30.7022 111.138 29.4624 111.129 28.013C111.12 26.3808 112.021 25.034 113.81 24.0216L113.966 23.9324L113.85 23.7987C112.989 22.8086 112.552 21.6223 112.543 20.2666C112.521 16.632 115.555 14.2595 120.276 14.2282H120.378C121.708 14.2282 122.872 14.4111 123.832 14.7634L123.943 14.8035L126.362 11.5391L129.364 14.1034L126.879 16.7301L126.955 16.8282C127.678 17.787 128.048 18.9064 128.057 20.1551C128.071 21.9122 127.361 23.4017 126.014 24.4631C124.648 25.5335 122.707 26.1088 120.396 26.1266H120.298C118.763 26.1266 117.407 25.8902 116.278 25.4175L116.18 25.3774L116.108 25.4532C115.711 25.8947 115.506 26.3585 115.51 26.8045C115.515 27.7499 116.309 28.3341 117.625 28.3653L123.046 28.5437C126.901 28.6909 129.306 30.778 129.329 33.989C129.356 38.074 125.773 40.5357 119.745 40.5759H119.597H119.588ZM116.412 32.3969C115.613 33.0926 115.193 33.8819 115.198 34.6936C115.207 35.8353 116.028 37.1955 119.887 37.1955H120.003C123.127 37.1732 124.639 36.3214 124.63 34.591C124.621 33.3468 123.734 32.5976 122.194 32.5351L116.461 32.3567L116.416 32.3924L116.412 32.3969ZM120.293 17.5016C118.375 17.515 117.192 18.5496 117.201 20.1997C117.21 21.7918 118.455 22.8577 120.293 22.8577C121.221 22.8532 121.989 22.5901 122.556 22.104C123.118 21.6179 123.426 20.9266 123.417 20.1596C123.408 18.5452 122.194 17.5016 120.325 17.5016H120.289H120.293Z"
              fill="black" />
            <path
              d="M138.234 33.6705C132.692 33.6705 128.94 29.755 128.904 23.9306C128.886 21.1924 129.806 18.6995 131.497 16.9067C133.183 15.1184 135.544 14.1194 138.145 14.1016H138.225C140.978 14.1016 143.294 15.0693 144.923 16.9022C146.694 18.8957 147.47 21.7588 147.118 24.9787L133.522 25.0723L133.545 25.2373C133.964 28.1316 135.722 29.862 138.252 29.862C140.233 29.8486 141.688 28.9344 142.196 27.4092L147.006 27.378C146.132 31.2891 142.892 33.6393 138.314 33.6705H138.234ZM138.132 17.9101C135.91 17.9235 134.241 19.3773 133.661 21.7989L133.616 21.9818L142.201 21.9238L142.192 21.7722C142.062 19.355 140.559 17.9146 138.172 17.9146H138.132V17.9101Z"
              fill="black" />
            <path
              d="M70.9888 15.1002L75.5131 15.069L75.5355 18.4182L75.821 18.4672C76.6152 16.2463 78.4134 14.8995 80.6354 14.8594H81.4921V19.6223L80.4882 19.6089C77.4407 19.7873 75.7764 21.8387 75.7987 25.4065L75.8523 33.5676L71.1182 33.5988L70.9932 15.1002H70.9888Z"
              fill="black" />
            <path d="M88.6045 19.4941H83.741V33.4796H88.6045V19.4941Z" fill="black" />
          </g>
          <defs>
            <linearGradient id="paint0_linear_7820_6414" x1="31.9384" y1="32.0515" x2="-8.05556" y2="-8.46682"
              gradientUnits="userSpaceOnUse">
              <stop stop-color="#7435FC" />
              <stop offset="0.32" stop-color="#7636FB" />
              <stop offset="0.51" stop-color="#7E3CFB" />
              <stop offset="0.67" stop-color="#8D45FA" />
              <stop offset="0.81" stop-color="#A152F8" />
              <stop offset="0.94" stop-color="#BB63F7" />
              <stop offset="1" stop-color="#CA6DF6" />
            </linearGradient>
            <clipPath id="clip0_7820_6414">
              <rect width="147.199" height="43" fill="white" />
            </clipPath>
          </defs>
        </svg>
        <!-- SVG form LOGO ends -->
      </div>
      <!-- date and time -->
      <div style="font-weight: 700; font-size: 16px; line-height: 24px; color:#5B6777;">
        ${date}
      </div>
      <!-- date and time ends -->
    </div>
    <!-- Header ends -->

    <!-- line below header -->
     <div style="height: 1px; flex-grow:1; border-bottom:solid 1px; border-color:#E0E3E8; margin-top:20px; margin-bottom:40px;"></div>


    <!-- Invoice info -->
    <div style="display:flex; gap:46px; flex-direction: column;">
      <!-- Title -->
      <div style="font-weight: 800; font-size: 24px; line-height: 26px; color:#454545;">Hey ${userName}, here's your invoice</div>
      <!-- details -->
      <div style="display: flex; flex-direction: column; gap:48px;">
        <!-- fare deatils -->
        <div style="display: flex; flex-direction: column; gap:24px;">
          <!-- main fare -->
          <div style="display: flex; flex-direction: row;">
            <div style="font-weight: 800; font-size: 20px; line-height: 26px; color:#14A255; flex-grow:1;">Payment Details</div>
            <div style="font-weight: 800; font-size: 20px; line-height: 26px; color:#14A255;">${finalAmount}</div>
          </div>
          <!-- main fare ends -->
          <!-- fare details card-->
          <div style="padding:40px 24px 40px 24px; background-color: #F8F9FB; display:flex; flex-direction: column; gap:32px; border:solid 2px #F1F2F7; border-radius:8px;">
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
            <div style="font-weight: 800; font-size: 20px; line-height: 26px; color:#14A255; flex-grow:1;">Ride Details</div>
            <div style="font-weight: 800; font-size: 20px; line-height: 26px; color:#14A255;">${rideId}</div>
          </div>
          <!-- Ride ID ends -->
          <!-- Ride Info Card -->
          <div style="padding:40px 24px 40px 24px; background-color: #F8F9FB; display:flex; flex-direction: column; gap:32px; border:solid 2px #F1F2F7; border-radius:8px;">
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
              <div style="width: 20px; flex-direction: column; justify-content: center; align-items: center; gap: 4px; display: inline-flex; padding-top: 6px; padding-bottom:22px;">
                <div style="width: 12px; height: 12px; background: #75C38A; border-radius: 9999px"></div>
                <div style="width: 1px; height: 80px; border-left: 1px #B9BABE dotted; margin-left:1px; flex-grow:1"></div>
                <div style="width: 12px; height: 12px; background: #F88080; border-radius: 9999px"></div>
              </div>
              <!-- dots -->
              <!-- source and dest -->
              <div style="display: flex; flex-direction: column; gap:35px">
                <!-- source info --> 
                <div style="display: flex; flex-direction: column; gap:8px;">
                  <div style="font-weight: 800; font-size: 16px; line-height: 24px; color:#454545;">${sourceTime}</div>
                  <div style="font-weight: 600; font-size: 16px; line-height: 22px; color:#6D7280;">${sourceAddress}</div>
                </div>
                <!-- source info ends -->
                <!-- dest info --> 
                <div style="display: flex; flex-direction: column; gap:8px; ">
                  <div style="font-weight: 800; font-size: 16px; line-height: 24px; color:#454545;">${destinationTime}</div>
                  <div style="font-weight: 600; font-size: 16px; line-height: 22px; color:#6D7280;">${destinationAddress}</div>
                </div>
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
      <div style="font-weight: 400; font-size: 16px; line-height: 20px; color:#868B98; font-style: italic; ${showTipInfo}">* Extra amount added by the customer for the service provided.</div>
      <div style="font-weight: 400; font-size: 16px; line-height: 20px; color:#868B98; font-style: italic; ${showWaitingInfo}">* Waiting charge is zero for the first 3 minutes. You will be charged {Amount} per minute of 
        wait time after that.</div>
    </div>
    <!-- Extra Info ends -->


  </div>`
}
