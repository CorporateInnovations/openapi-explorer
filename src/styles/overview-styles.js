import { css } from 'lit';

/* eslint-disable max-len */
export default css`

#overview {
	padding-top: 2.5rem;
	max-width: 700px;
	font-size: 19px;
}

.overview-bg-img {
	position: absolute;
	bottom: 0;
	right: 0;
	display: none;
}

@media only screen and (min-width: 768px) {
	.overview-bg-img {
		display: block;
	}
}

@media only screen and (max-width: 425px) {
	.buttons {
	  font-size: 15px !important;
	  padding: 9px 10px !important;
	}
	
	#api-title {
		margin: 0;
	}
}

.buttons {
	color: white;
	background: #084ff0;
	padding: 6px 28px;
	border-radius: 17px;
	border: none;
	cursor: pointer;
	min-height: 34px;
	font-size: 16px;
	padding: 9px 25px;
	line-height: 1;
}

a[id="contactUsOverview"] {
	text-decoration: underline;
}

#api-title {
	font-size:32px;
	font-weight: 700;
	color: #082c7c;"
}
`;

