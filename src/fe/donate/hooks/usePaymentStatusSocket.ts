import { useCallback, useEffect } from "react";
import { checkDonationPaid } from "../api";
import { createRealtimeSocket, type RealtimeClientSocket } from "@/shared/realtime/socket-client";
import { REALTIME_EVENTS, type PaymentStatusPayload, type RealtimeEvent } from "@/shared/realtime/events";
import type { DonationQrData, DonationStage } from "../types";

interface UsePaymentStatusSocketArgs {
  stage: DonationStage;
  qrData: DonationQrData | null;
  onPaid: () => void;
}

export default function usePaymentStatusSocket({ stage, qrData, onPaid }: UsePaymentStatusSocketArgs) {
  const checkPaymentStatusOnce = useCallback(async (orderId: string, statusToken: string) => {
    try {
      if (await checkDonationPaid(orderId, statusToken)) onPaid();
    } catch {
      // Websocket is primary; one-shot recovery failure is non-fatal.
    }
  }, [onPaid]);

  useEffect(() => {
    if (stage !== "qr" || !qrData?.orderId) return;

    let disposed = false;
    let socket: RealtimeClientSocket | null = null;
    const joinPayload = { orderId: qrData.orderId, statusToken: qrData.statusToken };

    const handleStatus = (event: unknown) => {
      const realtimeEvent = event as RealtimeEvent<typeof REALTIME_EVENTS.PAYMENT_STATUS_CHANGED>;
      const payload = realtimeEvent?.payload as PaymentStatusPayload | undefined;
      if (payload?.orderId === qrData.orderId && payload.paid) onPaid();
    };

    createRealtimeSocket()
      .then((client) => {
        if (disposed) {
          client.disconnect();
          return;
        }

        socket = client;
        client.on("connect", () => {
          client.emit("payment:join", joinPayload);
          checkPaymentStatusOnce(qrData.orderId, qrData.statusToken);
        });
        client.on(REALTIME_EVENTS.PAYMENT_STATUS_CHANGED, handleStatus);
        if (client.connected) {
          client.emit("payment:join", joinPayload);
          checkPaymentStatusOnce(qrData.orderId, qrData.statusToken);
        }
      })
      .catch((error) => {
        console.warn("Realtime payment status unavailable; one-shot status checks remain:", error);
      });

    return () => {
      disposed = true;
      socket?.off(REALTIME_EVENTS.PAYMENT_STATUS_CHANGED, handleStatus);
      socket?.disconnect();
    };
  }, [stage, qrData?.orderId, qrData?.statusToken, checkPaymentStatusOnce, onPaid]);
}
