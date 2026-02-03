/** @format */
const JobService = require("./job.service");
const JobEvents = require("./job.event");

module.exports = (io, socket) => {
  // Contractor or owner joins job room (for live auction view)
  socket.on(JobEvents.JOIN_JOB_ROOM, async ({ jobId }) => {
    try {
      if (!jobId) {
        socket.emit("error", { message: "jobId is required" });
        return;
      }
      const roomName = `job-room-${jobId}`;
      socket.join(roomName);
      console.log(`Socket ${socket.id} joined ${roomName}`);

      const bids = await JobService.getBidsForJob(jobId);
      socket.emit(JobEvents.ROOM_JOINED, { jobId, roomName });
      socket.emit(JobEvents.AUCTION_MEMBERS, { jobId, bids, count: bids.length });
    } catch (error) {
      console.error("Error joining job room:", error.message);
      socket.emit("error", { message: error.message });
    }
  });

  // Contractor submits bid via socket (alternative to API; persists to DB and broadcasts)
  socket.on(JobEvents.BID_SUBMIT, async (data) => {
    try {
      const {
        jobId,
        quotePrice,
        timeline,
        note,
        proposalUrl,
        proposal_documents,
      } = data || {};
      const contractorId = socket.user_id;
      if (!jobId || quotePrice == null) {
        socket.emit("error", { message: "jobId and quotePrice are required" });
        return;
      }

      const bid = await JobService.submitBid({
        jobId,
        contractorId,
        quotePrice,
        timeline,
        note,
        proposalUrl,
        proposal_documents,
      });

      const roomName = `job-room-${jobId}`;
      io.to(roomName).emit(JobEvents.BID_RECEIVED, bid);
      console.log(`Bid submitted for job ${jobId} by contractor ${contractorId}`);
    } catch (error) {
      console.error("Error submitting bid:", error.message);
      socket.emit("error", { message: error.message });
    }
  });
};
