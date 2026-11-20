package com.carebridge.pharmacy.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record PharmacyRequest(

		@NotBlank @Size(min = 3, max = 150) String pharmacyName,

		@NotBlank @Size(max = 100) String licenseNumber,

		@NotBlank @Pattern(regexp = "^[0-9]{10}$") String phoneNumber,

		@Email @Size(max = 150) String contactEmail,

		@NotBlank @Size(max = 500) String address,

		@NotBlank @Size(max = 100) String city,

		@NotBlank @Size(max = 100) String state,

		@NotBlank @Pattern(regexp = "^[0-9]{6}$") String pincode

) {
}