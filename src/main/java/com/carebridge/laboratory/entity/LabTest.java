package com.carebridge.laboratory.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.carebridge.laboratory.enums.LabTestCategory;
import jakarta.persistence.*;

@Entity
@Table(name = "lab_tests")
public class LabTest {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true, length = 150)
	private String testName;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 50)
	private LabTestCategory category;

	@Column(length = 1000)
	private String description;

	@Column(nullable = false, precision = 10, scale = 2)
	private BigDecimal price;

	@Column(nullable = false, length = 100)
	private String sampleType;

	@Column(length = 1000)
	private String preparationInstructions;

	@Column(nullable = false)
	private boolean active = true;

	private LocalDateTime createdAt;

	private LocalDateTime updatedAt;

	@PrePersist
	protected void onCreate() {
		createdAt = LocalDateTime.now();
		updatedAt = LocalDateTime.now();
	}

	@PreUpdate
	protected void onUpdate() {
		updatedAt = LocalDateTime.now();
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getTestName() {
		return testName;
	}

	public void setTestName(String testName) {
		this.testName = testName;
	}

	public LabTestCategory getCategory() {
		return category;
	}

	public void setCategory(LabTestCategory category) {
		this.category = category;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public BigDecimal getPrice() {
		return price;
	}

	public void setPrice(BigDecimal price) {
		this.price = price;
	}

	public String getSampleType() {
		return sampleType;
	}

	public void setSampleType(String sampleType) {
		this.sampleType = sampleType;
	}

	public String getPreparationInstructions() {
		return preparationInstructions;
	}

	public void setPreparationInstructions(String preparationInstructions) {
		this.preparationInstructions = preparationInstructions;
	}

	public boolean isActive() {
		return active;
	}

	public void setActive(boolean active) {
		this.active = active;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}
}