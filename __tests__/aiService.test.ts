import { handleToolCalls } from '../services/aiService';

describe('aiService Functions', () => {
  it('should book an appointment at the closest active clinic on critical urgency', async () => {
    // Mock the payload OpenAI would send back
    const mockToolCalls = [
      {
        id: "call_abc123",
        function: {
          name: "bookAppointment",
          arguments: JSON.stringify({
            reason: "Severe chest pain and difficulty breathing",
            severityLevel: "critical"
          })
        }
      }
    ];

    const responses = await handleToolCalls(mockToolCalls);

    // Verify response
    expect(responses).toHaveLength(1);
    expect(responses[0].tool_call_id).toBe("call_abc123");
    
    const parsedContent = JSON.parse(responses[0].content as string);
    expect(parsedContent.status).toBe("success");
    expect(parsedContent.bookedHospital).toBeDefined(); // Ensures clinic was found
    expect(parsedContent.appointmentTime).toContain("Immediate");
  });

  it('should escalate to a human representative when requested', async () => {
    const mockToolCalls = [
      {
        id: "call_def456",
        function: {
          name: "escalateToHuman",
          arguments: JSON.stringify({
            reason: "Patient wants to schedule a follow up directly with a human"
          })
        }
      }
    ];

    const responses = await handleToolCalls(mockToolCalls);

    expect(responses).toHaveLength(1);
    const parsedContent = JSON.parse(responses[0].content as string);
    expect(parsedContent.status).toBe("success");
    expect(parsedContent.message).toContain("human representative will join");
  });
});
