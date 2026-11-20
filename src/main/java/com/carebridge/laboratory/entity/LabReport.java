package com.carebridge.laboratory.entity;

import java.time.LocalDateTime;
import com.carebridge.auth.entity.User;
import jakarta.persistence.*;

@Entity
@Table(name = "lab_reports")
public class LabReport {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "lab_order_id", nullable = false, unique = true)
	private LabOrder labOrder;

	@Column(nullable = false, length = 2000)
	private String resultSummary;

	@Column(length = 3000)
	private String findings;

	@Column(length = 1000)
	private String reportFileUrl;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "uploaded_by", nullable = false)
	private User uploadedBy;

	private LocalDateTime uploadedAt;

	@PrePersist
	protected void onCreate() {
		uploadedAt = LocalDateTime.now();
	}

	public Long getId() {
		return id;
	}

	public LabOrder getLabOrder() {
		return labOrder;
	}

	public void setLabOrder(LabOrder labOrder) {
		this.labOrder = labOrder;
	}

	public String getResultSummary() {
		return resultSummary;
	}

	public void setResultSummary(String resultSummary) {
		this.resultSummary = resultSummary;
	}

	public String getFindings() {
		return findings;
	}

	public void setFindings(String findings) {
		this.findings = findings;
	}

	public String getReportFileUrl() {
		return reportFileUrl;
	}

	public void setReportFileUrl(String reportFileUrl) {
		this.reportFileUrl = reportFileUrl;
	}

	public User getUploadedBy() {
		return uploadedBy;
	}

	public void setUploadedBy(User uploadedBy) {
		this.uploadedBy = uploadedBy;
	}

	public LocalDateTime getUploadedAt() {
		return uploadedAt;
	}
}