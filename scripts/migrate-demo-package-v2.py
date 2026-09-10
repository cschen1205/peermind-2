#!/usr/bin/env python3
"""Migrate the Model Soups 1.0 demo package to DemoDataPackage 2.0."""

from __future__ import annotations

import json
from pathlib import Path

SRC = Path("/home/cschen/projects/peermind-2/app/public/demo-data/model-soups-v1.demo.json")
DST = Path("/home/cschen/projects/peermind-2/app/public/demo-data/model-soups-v2.demo.json")

AGENT_ROLES = {
    "AG-CONTRIB": "reviewer",
    "AG-THEORY": "reviewer",
    "AG-SOURCE": "verifier",
    "AG-SCOPE": "reviewer",
    "AG-NUM": "verifier",
    "AG-PROOF": "verifier",
}

PREFERRED_TOOLS = {
    "AG-CONTRIB": ["Literature / Reference Auditor", "Source Auditor"],
    "AG-THEORY": ["Source Auditor", "Formal Proof Verifier"],
    "AG-SOURCE": ["Source Auditor"],
    "AG-SCOPE": ["Source Auditor"],
    "AG-NUM": ["Numerical Auditor", "Source Auditor"],
    "AG-PROOF": ["Formal Proof Verifier"],
}

TARGET_CLAIMS = {
    "F01": "N-PROBLEM",
    "F02": "N-ALIGN",
    "F03": "N-CONVNEXT",
    "F04": "N-QWEN",
    "F05": "N-SCALE-GAP",
    "F06": "N-ALIGN",
    "F07": "N-CLIP",
    "F08": "N-ALIGN",
    "F09": "N-ALIGN",
    "F10": "N-COEFF",
    "F11": "N-ALIGN",
    "F12": "N-QWEN",
}

# evidenceVerdict, status, proposedSeverity, finalSeverity
FINDING_STATUS = {
    "F01": ("partially_supported", "partially_supported", "major", "major"),
    "F02": ("supported", "verified_high_impact", "major", "major"),
    "F03": ("refuted", "refuted", "major", "none"),
    "F04": ("supported", "verified_high_impact", "major", "major"),
    "F05": ("supported", "verified_high_impact", "major", "major"),
    "F06": ("supported", "severity_downgraded", "minor", "suggestion"),
    "F07": ("supported", "verified_moderate_impact", "minor", "minor"),
    "F08": ("supported", "verified_high_impact", "major", "major"),
    "F09": ("supported", "verified_high_impact", "major", "major"),
    "F10": ("supported", "verified_high_impact", "major", "major"),
    "F11": ("supported", "verified_high_impact", "major", "major"),
    "F12": ("supported", "verified_moderate_impact", "minor", "minor"),
}

IMPACT = {
    "F01": {
        "scopeRelevance": "high",
        "scopeExplanation": "Novelty positioning frames the paper's publication claim, so the finding sits on the central contribution.",
        "necessity": "moderate",
        "necessityExplanation": "A missing external comparison does not by itself invalidate the single-checkpoint construction or the reported experiments.",
        "sensitivity": "not_identifiable",
        "sensitivityExplanation": "No paper-internal wording change can create the missing operation-level literature comparison.",
    },
    "F02": {
        "scopeRelevance": "high",
        "scopeExplanation": "The coefficient rule is presented as the mechanism that should preserve robustness, so the theory gap applies to the method's justification.",
        "necessity": "high",
        "necessityExplanation": "Without a risk-based derivation or competing-rule comparison, the weighting rule remains a design choice rather than a demonstrated necessity.",
        "sensitivity": "not_identifiable",
        "sensitivityExplanation": "A substantive theory cannot be recovered by editing isolated sentences; the missing derivation is not an identifiable local intervention.",
    },
    "F03": {
        "scopeRelevance": "moderate",
        "scopeExplanation": "The absence allegation concerned architectural coverage in the current snapshot, not the merging algorithm itself.",
        "necessity": "low",
        "necessityExplanation": "Impact is not applicable once the current-snapshot absence allegation is refuted.",
        "sensitivity": "not_identifiable",
        "sensitivityExplanation": "Impact is not applicable because the evidence verdict is refuted.",
    },
    "F04": {
        "scopeRelevance": "high",
        "scopeExplanation": "OOD robustness is a headline claim for the language evaluation, so the protocol-scope finding applies to that claim.",
        "necessity": "high",
        "necessityExplanation": "The reported accuracies can stand as cross-benchmark results, but they do not isolate distribution shift as currently labeled.",
        "sensitivity": "moderate",
        "sensitivityExplanation": "Narrowing the claim to cross-benchmark generalization would resolve the scope concern; changing an unrelated table format would not.",
    },
    "F05": {
        "scopeRelevance": "high",
        "scopeExplanation": "The manuscript motivates MonoSoup through large-model checkpoint cost, so missing scale measurements apply to that practical claim.",
        "necessity": "high",
        "necessityExplanation": "The claimed advantage is most consequential at the 2–7B+ regime that the current experiments do not profile.",
        "sensitivity": "not_identifiable",
        "sensitivityExplanation": "End-to-end multi-billion-parameter measurements cannot be created by a local manuscript edit.",
    },
    "F06": {
        "scopeRelevance": "low",
        "scopeExplanation": "The pair-count discrepancy is local to Figure 2 reporting and does not rewrite the merging procedure.",
        "necessity": "low",
        "necessityExplanation": "The main empirical claims do not depend on identifying the six missing pairs, unless those pairs change the alignment summary.",
        "sensitivity": "high",
        "sensitivityExplanation": "An exact exclusion disclosure would resolve the reporting finding; an unrelated figure-style change would not.",
    },
    "F07": {
        "scopeRelevance": "moderate",
        "scopeExplanation": "Uncertainty reporting applies to the strong-checkpoint comparisons, not to the larger recoveries on collapsed checkpoints.",
        "necessity": "moderate",
        "necessityExplanation": "Point estimates can remain informative, but claims of consistent improvement over strong alternatives need variability evidence.",
        "sensitivity": "moderate",
        "sensitivityExplanation": "Stable repeated-run estimates would weaken the concern; rewording the figure caption would not.",
    },
    "F08": {
        "scopeRelevance": "high",
        "scopeExplanation": "The alignment story is the stated bridge from the diagnostic analysis to the proposed method.",
        "necessity": "high",
        "necessityExplanation": "If cosine alpha is residual-energy share rather than alignment, the mechanistic narrative needs to be rewritten even if the algorithm is unchanged.",
        "sensitivity": "high",
        "sensitivityExplanation": "Renaming the quantity and separating CKA evidence would repair the semantic defect; leaving the identity and the wording mismatched would not.",
    },
    "F09": {
        "scopeRelevance": "high",
        "scopeExplanation": "The method is motivated as combining two complementary geometric signals, so dependence among those signals applies to the design story.",
        "necessity": "high",
        "necessityExplanation": "If cosine alpha is constrained by the same spectrum as R, the complementary-signal claim needs incremental-information evidence.",
        "sensitivity": "moderate",
        "sensitivityExplanation": "A controlled incremental-information analysis could support or weaken the concern; a caption change would not.",
    },
    "F10": {
        "scopeRelevance": "high",
        "scopeExplanation": "The sum-to-one constraint is part of the proposed mechanism, so an untested shrinkage alternative applies to causal identification.",
        "necessity": "high",
        "necessityExplanation": "Without a matched layer-wise shrinkage control, the experiments do not identify which part of the update causes the gain.",
        "sensitivity": "not_identifiable",
        "sensitivityExplanation": "The decisive matched baseline requires a new experiment, not a local wording intervention.",
    },
    "F11": {
        "scopeRelevance": "high",
        "scopeExplanation": "The claimed geometric bridge from multi-model alignment to a single-update rule is central to the paper's novelty narrative.",
        "necessity": "moderate",
        "necessityExplanation": "Section 3 can remain useful empirical evidence even if it does not derive the Section 4 mechanism.",
        "sensitivity": "high",
        "sensitivityExplanation": "Narrowing the claim from derivation to inspiration would resolve the logical overreach; hiding an unrelated appendix would not.",
    },
    "F12": {
        "scopeRelevance": "moderate",
        "scopeExplanation": "The +9.2 statement is a language-evaluation magnitude claim, not a change to the vision experiments or the algorithm.",
        "necessity": "moderate",
        "necessityExplanation": "The discrepancy affects the stated size of the language-model evidence, not whether Table 2 cells themselves exist.",
        "sensitivity": "high",
        "sensitivityExplanation": "Naming the comparison baseline or correcting the deltas would resolve the finding; changing unrelated prose would not.",
    },
}

CALIBRATED = {
    "F01": "The single-checkpoint setting is a useful practical framing. Paper-internal related work does not establish how much of the operation goes beyond existing SVD-based editors; that comparison remains an open literature question rather than a demonstrated absence.",
    "F02": "Equation 6 has well-stated bilinear uniqueness, monotonicity, and Lipschitz properties. Those properties do not show that the chosen boundary conditions are necessary for OOD robustness, so the rule should be presented as a constrained design choice unless a risk-based comparison is added.",
    "F03": "The current supplied manuscript contains ConvNeXt and freevariance appendix evidence. The categorical claim that non-Transformer evidence is absent from this snapshot is therefore false. The original-review concern is recorded as resolved by revision, not as a present-tense absence.",
    "F04": "The Qwen numbers can be read as cross-benchmark generalization. They do not isolate distribution shift, so the language evaluation should not be labeled a clean OOD-robustness result without a controlled shift protocol.",
    "F05": "The efficiency motivation is clear, but the manuscript does not report accuracy or resource profiles at the multi-billion-parameter scale where the claimed checkpoint-cost advantage is most consequential. The smaller-model results remain usable evidence at the evaluated sizes.",
    "F06": "70 choose 2 is 2,415, so six pairs are unaccounted for in the reported 2,409 count. This is a bounded reporting issue. Disclose the exclusions; do not treat the discrepancy as evidence that the alignment analysis is fabricated.",
    "F07": "Weak-checkpoint recoveries are large. Strong-checkpoint gains are modest and lack variability estimates, so claims of consistent improvement over strong alternatives should be qualified until uncertainty is reported.",
    "F08": "Appendix C defines cosine alpha as a normalized residual-energy magnitude. Describing that quantity as alignment or pretrained-weight preservation overstates the identity. Rename it residual-energy share and treat CKA preservation as a separate observation.",
    "F09": "Spectral decay and cosine alpha are functions of the same singular-value spectrum. Complementarity is not established until incremental predictive value beyond R, retained rank, and rho is shown.",
    "F10": "Forcing the high- and low-energy coefficients to sum to one induces layer-wise shrinkage. Wise-FT tests a global interpolant, not a matched layer-wise control, so the experiments do not yet isolate spectral reweighting from shrinkage.",
    "F11": "Section 3 studies pairwise alignment between distinct same-task updates. MonoSoup operates on the spectrum of one update. Present Section 3 as motivation unless a mapping between those objects is demonstrated.",
    "F12": "The statement that GSM Plus and GSM8K Platinum each improve by +9.2 is not recovered from the Table 2 fine-tuned-to-MonoSoup differences. Name the intended baseline or replace the sentence with the traceable deltas.",
}

VERIFICATION_QUESTIONS = {
    "F01": "Does the manuscript establish an operation-level difference from the closest SVD-based editors, or only a useful single-checkpoint setting?",
    "F02": "Does the coefficient derivation show necessity for robustness, or only admissible mathematical properties inside a chosen family?",
    "F03": "Is non-Transformer evidence absent from the current supplied snapshot?",
    "F04": "Do the language benchmarks isolate distribution shift, or only cross-benchmark generalization?",
    "F05": "Are there quality and resource measurements at the scale where the efficiency claim is most consequential?",
    "F06": "Does the reported Figure 2 pair count match n choose 2, and is any exclusion disclosed?",
    "F07": "Are the strong-checkpoint improvements accompanied by uncertainty that would support a consistency claim?",
    "F08": "Does the definition of cosine alpha identify two vectors whose inner product is alignment, or a residual-energy fraction?",
    "F09": "Does cosine alpha add information beyond R, retained rank, and rho?",
    "F10": "Do the experiments isolate spectral reweighting from layer-wise update shrinkage?",
    "F11": "Is there a mapping from pairwise multi-model alignment to the single-update spectral rule?",
    "F12": "Can the +9.2 language-gain sentence be reproduced from the cited table and a named baseline?",
}

NODE_LABELS = {
    "F01-W1": ("Plan contribution check", "Director"),
    "F01-W2": ("Source-audit related work", "Source Auditor"),
    "F01-W3": ("Stop at literature gap", "Literature Auditor"),
    "F02-W1": ("Parse derivation", "Theory / Source"),
    "F02-W2": ("Separate properties from guarantee", "Theory reviewer"),
    "F02-W3": ("Replan for risk theory", "Director"),
    "F03-W1": ("Search main text", "Source Auditor"),
    "F03-W2": ("Search appendices", "Source Auditor"),
    "F03-W3": ("Record evidence verdict", "Planner"),
    "F04-W1": ("Map benchmark roles", "Scope reviewer"),
    "F04-W2": ("Test claim scope", "Source Auditor"),
    "F05-W1": ("Trace efficiency claim", "Scope reviewer"),
    "F05-W2": ("Search scale evidence", "Source Auditor"),
    "F05-W3": ("Stop at evidence gap", "Planner"),
    "F06-W1": ("Read reported count", "Numerical Auditor"),
    "F06-W2": ("Recompute n choose 2", "Numerical Auditor"),
    "F06-W3": ("Search exclusion note", "Source Auditor"),
    "F07-W1": ("Compute point-estimate gap", "Numerical Auditor"),
    "F07-W2": ("Search uncertainty", "Source Auditor"),
    "F07-W3": ("Bound the conclusion", "Planner"),
    "F08-W1": ("Resolve the definition", "Theory reviewer"),
    "F08-W2": ("Compare semantic claims", "Source Auditor"),
    "F08-W3": ("Record evidence verdict", "Planner"),
    "F09-W1": ("Substitute Appendix C identity", "Theory reviewer"),
    "F09-W2": ("Inspect component ablation", "Numerical Auditor"),
    "F09-W3": ("Request dependence analysis", "Director"),
    "F10-W1": ("Compare coefficient baselines", "Theory reviewer"),
    "F10-W2": ("Trace shrinkage alternative", "Numerical Auditor"),
    "F10-W3": ("Request matched control", "Director"),
    "F11-W1": ("Map Section 3 objects", "Theory reviewer"),
    "F11-W2": ("Map Section 4 objects", "Source Auditor"),
    "F11-W3": ("Test the implication", "Planner"),
    "F12-W1": ("Locate narrative claim", "Numerical Auditor"),
    "F12-W2": ("Recompute table deltas", "Numerical Auditor"),
    "F12-W3": ("Search named baseline", "Source Auditor"),
}

OLD_VERDICT_TO_EVIDENCE = {
    "verified": "supported",
    "supported": "supported",
    "refuted": "refuted",
    "human_required": "partially_supported",
    "unverified": "unverifiable",
    "disputed": "open_question",
    "not_checked": "open_question",
}

COMPARISON_STATUS = {
    "human_required": "partially_supported",
    "supported": "verified_high_impact",
    "refuted": "refuted",
    "verified": "verified_moderate_impact",
    "not_checked": "open_question",
    "unverified": "unverifiable",
    "disputed": "open_question",
}

# Override comparison status with finding final status when a finding is attached.
FINDING_FOR_THEME_OVERRIDE = True


def importance_to_severity(level: str) -> str:
    lowered = level.lower()
    if lowered == "high":
        return "major"
    if lowered == "moderate":
        return "minor"
    return "suggestion"


def migrate_events(events: list, finding_id: str, skip_node_id: str) -> list:
    out = []
    for event in events:
        if event["type"] == "verdict":
            mapped = FINDING_STATUS[finding_id][0]
            out.append({"type": "evidence_verdict", "status": mapped})
            continue
        out.append(event)
    # Insert skip just before the final stop, or append.
    skip_event = {
        "type": "skip_node",
        "nodeId": skip_node_id,
        "reason": "No theorem-level guarantee is claimed, so the Formal Proof Verifier is not invoked.",
    }
    if out and out[-1]["type"] == "stop":
        out.insert(-1, skip_event)
    else:
        out.append(skip_event)
    return out


def migrate_contract(finding: dict) -> dict:
    old = finding["contract"]
    agent = finding["reviewerAgentId"]
    fid = finding["id"]
    return {
        "allegation": old["allegation"],
        "targetClaimId": TARGET_CLAIMS.get(fid),
        "verificationQuestion": VERIFICATION_QUESTIONS[fid],
        "evidenceBurden": old["evidenceBurden"],
        "falsifier": old["falsifier"],
        "preferredTools": PREFERRED_TOOLS.get(agent, ["Source Auditor"]),
        "stopRule": old["stopRule"],
    }


def main() -> None:
    data = json.loads(SRC.read_text())

    for agent in data["reviewerRun"]["candidateAgents"]:
        agent["role"] = AGENT_ROLES[agent["id"]]

    old_review = data["reviewerRun"]["review"]
    routing = data["reviewerRun"].pop("routingEvents")

    findings = []
    impact_assessments = []
    verifications = []

    by_finding_inv = {item["findingId"]: item for item in data["investigations"]}

    for finding in data["findings"]:
        fid = finding["id"]
        evidence_verdict, status, proposed, final = FINDING_STATUS[fid]
        impact = IMPACT[fid]
        contract = migrate_contract(finding)
        findings.append(
            {
                "id": fid,
                "category": finding["category"],
                "critique": finding["critique"],
                "reviewerAgentId": finding["reviewerAgentId"],
                "targetClaimId": TARGET_CLAIMS.get(fid),
                "sourceIds": finding["sourceIds"],
                "proposedSeverity": proposed,
                "contract": contract,
                "evidenceFor": finding["evidenceFor"],
                "evidenceAgainst": finding["evidenceAgainst"],
                "missingEvidence": finding["missingEvidence"],
                "evidenceVerdict": evidence_verdict,
                "impact": {
                    "scopeRelevance": impact["scopeRelevance"],
                    "necessity": impact["necessity"],
                    "sensitivity": impact["sensitivity"],
                    "explanation": impact["scopeExplanation"],
                },
                "finalSeverity": final,
                "status": status,
                "calibratedComment": CALIBRATED[fid],
                "limitations": finding["limitations"],
                "nextAction": finding.get("nextAction"),
            }
        )

        cf_id = "CF-F06" if fid == "F06" else "CF-F01" if fid == "F01" else None
        assessment_id = f"IA-{fid}"
        impact_assessments.append(
            {
                "id": assessment_id,
                "findingId": fid,
                "scopeRelevance": impact["scopeRelevance"],
                "scopeExplanation": impact["scopeExplanation"],
                "necessity": impact["necessity"],
                "necessityExplanation": impact["necessityExplanation"],
                "sensitivity": impact["sensitivity"],
                "sensitivityExplanation": impact["sensitivityExplanation"],
                "counterfactualTestId": cf_id,
                "finalSeverity": final,
                "status": status,
            }
        )

        inv = by_finding_inv[fid]
        skip_id = f"{fid}-SKIP-PROOF"
        first_node = inv["workflowNodes"][0]["id"]
        planner_id = f"{fid}-PLAN"
        nodes = [
            {
                "id": planner_id,
                "label": "Plan verification",
                "subtitle": "Director",
                "kind": "inspect",
            }
        ]
        for node in inv["workflowNodes"]:
            relabel = NODE_LABELS.get(node["id"])
            next_node = dict(node)
            if relabel:
                next_node["label"] = relabel[0]
                next_node["subtitle"] = relabel[1]
            nodes.append(next_node)
        nodes.append(
            {
                "id": skip_id,
                "label": "Formal Proof Verifier",
                "subtitle": "Skipped",
                "kind": "skip",
            }
        )
        edges = [
            {
                "id": f"{fid}-X-PLAN",
                "source": planner_id,
                "target": first_node,
                "relation": "route tools",
            },
            *inv["workflowEdges"],
        ]
        events = [
            {"type": "message", "text": "Director assigns auditors and records tools that will not run."},
            {"type": "activate_node", "nodeId": planner_id},
            {"type": "complete_node", "nodeId": planner_id},
            *migrate_events(inv["events"], fid, skip_id),
        ]
        invoked = []
        for agent_id in inv["agentIds"]:
            for tool in PREFERRED_TOOLS.get(agent_id, []):
                if tool != "Formal Proof Verifier" and tool not in invoked:
                    invoked.append(tool)
        ledger_records = inv["finalLedger"]["for"] + inv["finalLedger"]["against"] + inv["finalLedger"]["gaps"]
        provenance = []
        for record in ledger_records:
            for source_id in record["sourceIds"]:
                if source_id not in provenance:
                    provenance.append(source_id)
        verifications.append(
            {
                "findingId": fid,
                "contract": contract,
                "agentIds": inv["agentIds"],
                "invokedToolIds": invoked,
                "skippedTools": [
                    {
                        "id": "AG-PROOF",
                        "label": "Formal Proof Verifier",
                        "reason": "The manuscript does not claim a theorem-level guarantee.",
                    }
                ],
                "workflowNodes": nodes,
                "workflowEdges": edges,
                "events": events,
                "ledger": {
                    "for": inv["finalLedger"]["for"],
                    "against": inv["finalLedger"]["against"],
                    "gaps": inv["finalLedger"]["gaps"],
                    "provenance": provenance,
                    "toolsUsed": invoked,
                },
                "evidenceVerdict": evidence_verdict,
                "limitations": inv["limitations"],
                "impactAssessmentId": assessment_id,
            }
        )

    old_cf = {item["findingId"]: item for item in data["counterfactualTests"]}
    f06 = old_cf["F06"]
    f01 = old_cf["F01"]
    counterfactuals = [
        {
            "id": "CF-F06",
            "findingId": "F06",
            "identifiable": True,
            "currentSupport": f06["baseline"]["reviewerResponse"],
            "intervention": f06["targeted"]["description"],
            "reevaluatedSupport": f06["targeted"]["reviewerResponse"],
            "sensitivity": "high",
            "current": {
                "label": f06["baseline"]["label"],
                "description": f06["baseline"]["description"],
                "changedSourceIds": f06["baseline"]["changedSourceIds"],
                "claimSupport": f06["baseline"]["reviewerResponse"],
            },
            "intervened": {
                "label": f06["targeted"]["label"],
                "description": f06["targeted"]["description"],
                "changedSourceIds": f06["targeted"]["changedSourceIds"],
                "claimSupport": f06["targeted"]["reviewerResponse"],
            },
        },
        {
            "id": "CF-F01",
            "findingId": "F01",
            "identifiable": False,
            "reason": f01["explanation"],
        },
    ]

    if FINDING_FOR_THEME_OVERRIDE:
        finding_status_by_id = {item["id"]: item["status"] for item in findings}
    comparison = data.get("comparisonPreset")
    if comparison:
        for theme in comparison["result"]["themes"]:
            old_status = theme.pop("defenderStatus", None)
            mapped = COMPARISON_STATUS.get(old_status, "open_question") if old_status else None
            if theme["peerMindFindingIds"]:
                mapped = finding_status_by_id.get(theme["peerMindFindingIds"][0], mapped)
            if mapped:
                theme["verificationStatus"] = mapped

    ask = data.get("askPeerMind")
    if ask:
        for response in ask.get("preparedResponses", []):
            for action in response.get("response", {}).get("actions", []):
                if action.get("type") == "open_investigation":
                    action["type"] = "open_verification"

    package = {
        "schemaVersion": "2.0",
        "demo": data["demo"],
        "paper": {**data["paper"], "conferenceStyle": "iclr"},
        "sections": data["sections"],
        "sources": data["sources"],
        "paperGraph": data["paperGraph"],
        "paperSummary": data["paperSummary"],
        "reviewPlan": {
            "paperType": "Empirical machine-learning methods paper with a geometric explanation and no theorem-level guarantee.",
            "centralClaimIds": ["N-ALIGN", "N-PROBLEM"],
            "selectedReviewerIds": ["AG-CONTRIB", "AG-THEORY", "AG-SCOPE"],
            "selectedVerifierIds": ["AG-SOURCE", "AG-NUM"],
            "skippedReviewers": [],
            "skippedVerifiers": [
                {
                    "id": "AG-PROOF",
                    "label": "Formal Proof Verifier",
                    "reason": "Skipped because no theorem-level guarantee is claimed.",
                }
            ],
            "routingEvents": routing,
            "notes": [
                "The director selects reviewers from paper signals and verification tools from the evidence burden. Formal proof is skipped on purpose.",
            ],
        },
        "reviewerRun": {
            "signals": data["reviewerRun"]["signals"],
            "candidateAgents": data["reviewerRun"]["candidateAgents"],
            "selectedAgentIds": data["reviewerRun"]["selectedAgentIds"],
            "review": {
                "findingIds": old_review["findingIds"],
                "draftNotes": [
                    "Candidate findings only. The conference review is written after verification, on Synthesize.",
                ],
                "authorQuestions": [],
            },
        },
        "findings": findings,
        "verifications": verifications,
        "impactAssessments": impact_assessments,
        "counterfactualTests": counterfactuals,
        "synthesis": {
            "summary": old_review["overallAssessment"],
            "strengths": old_review["strengths"],
            "majorWeaknesses": [
                "The alignment narrative does not match the residual-energy quantity used by the method.",
                "A matched layer-wise shrinkage control is needed before the mechanism can be identified.",
                "Language results support cross-benchmark generalization more than a clean OOD conclusion.",
            ],
            "minorWeaknesses": [
                "Figure 2 is missing a disclosure for six excluded pairs.",
                "The +9.2 language-gain sentence is not recovered from Table 2.",
                "Strong-checkpoint gains lack uncertainty estimates.",
            ],
            "authorQuestions": old_review["authorQuestions"],
            "evidenceNotes": [
                "Statuses mix supported evidence, one refuted absence allegation, one novelty finding that remains only partially supported, and one numerical finding whose severity is downgraded.",
            ],
            "recommendation": data["report"]["summary"],
            "confidence": "Mixed. Numerical checks are local and deterministic; mechanism and novelty questions remain bounded by missing experiments or external literature.",
            "conferenceStyle": "iclr",
        },
        "askPeerMind": ask,
        "comparisonPreset": comparison,
    }

    DST.write_text(json.dumps(package, indent=2, ensure_ascii=False) + "\n")
    print(f"Wrote {DST} ({DST.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
