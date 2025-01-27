import * as vscode from 'vscode';

const fasmInstructions = `
aaa|aad|abs|aam|adc|add|and|arpl|bound|bsf|bsr|bswap|bt|btc|btr|bts|call|cbw|cdq|clc|cld|cli|clts|cmc|cmp|cmps|cmpsb|cmpsd|cmpsw|cmpxchg|cwd|cwde|daa|das|dec|div|emms|enter|f2xm1|fabs|fadd|faddp|fbld|fbstp|fchs|fclex|fcmovb|fcmovbe|fcmove|fcmovnb|fcmovnbe|fcmovne|fcmovnu|fcmovu|fcom|fcomi|fcomip|fcomp|fcompp|fcos|fdecstp|fdiv|fdivp|fdivr|fdivrp|femms|ffree|fiadd|ficom|ficomp|fidiv|fidivr|fild|fimul|fincstp|finit|fist|fistp|fisub|fisubr|fld|fld1|fldcw|fldenv|fldl2e|fldl2t|fldlg2|fldln2|fldpi|fldz|fmul|fmulp|fnclex|fninit|fnop|fnsave|fnstcw|fnstenv|fnstsw|fpatan|fprem1|fptan|frndint|frstor|fsave|fscale|fsin|fsincos|fsqrt|fst|fstcw|fstenv|fstp|fstsw|fsub|fsubp|fsubr|fsubrp|ftst|fucom|fucomi|fucomip|fucomp|fucompp|fwait|fxch|fxtract|fyl2xp1|hlt|idiv|imul|in|inc|ins|insb|insd|insw|int|into|invd|invlpg|iret|iretd|iretw|ja|jae|jb|jbe|jc|jcxz|je|jecxz|jg|jge|jl|jle|jmp|jna|jnae|jnb|jnbe|jnc|jne|jng|jnge|jnl|jnle|jno|jnp|jns|jnz|jo|jp|jpe|jpo|js|jz|lahf|lar|lds|lea|leave|les|lfs|lgdt|lgs|lidt|lldt|lmsw|lock|lods|lodsb|lodsd|lodsw|loop|loope|loopne|loopnz|loopz|lsl|lss|ltr|mov|movd|movq|movs|movsb|movsd|movsw|movsx|movzx|mul|neg|nop|not|or|out|outs|outsb|outsd|outsw|packssdw|packsswb|packuswb|paddb|paddd|paddsb|paddsw|paddusb|paddusw|paddw|pand|pandn|pavgusb|pcmpeqb|pcmpeqd|pcmpeqw|pcmpgtb|pcmpgtd|pcmpgtw|pf2id|pfacc|pfadd|pfcmpeq|pfcmpge|pfcmpgt|pfmax|pfmin|pfmul|pfrcp|pfrcpit1|pfrcpit2|pfrsqit1|pfrsqrt|pfsub|pfsubr|pi2fd|pmaddwd|pmulhrw|pmulhw|pmullw|pop|popa|popad|popaw|popf|popfd|popfw|por|prefetch|prefetchw|pslld|psllq|psllw|psrad|psraw|psrld|psrlq|psrlw|psubb|psubd|psubsb|psubsw|psubusb|psubusw|psubw|punpckhbw|punpckhdq|punpckhwd|punpcklbw|punpckldq|punpcklwd|push|pusha|pushad|pushaw|pushf|pushfd|pushfw|pxor|rcl|rcr|rep|repe|repne|repnz|repz|ret|rol|ror|sahf|sal|sar|sbb|scas|scasb|scasd|scasw|seta|setae|setb|setbe|setc|sete|setg|setge|setl|setle|setna|setnae|setnb|setnbe|setnc|setne|setng|setnge|setnl|setnle|setno|setnp|setns|setnz|seto|setp|setpo|sets|setz|sgdt|shl|shld|shr|shrd|sidt|sldt|smsw|stc|std|sti|stos|stosb|stosd|stosw|str|sub|test|verr|verw|wait|wbinvd|xadd|xchg|xlat|xlatb|xor|rdtsc|cpuid
`.split('|');

const fasmRegisters = `eax|ax|al|ah|ebx|bx|bl|bh|ecx|cx|cl|ch|edx|dx|dl|dh|esi|si|edi|di|ebp|bp|esp|sp|cs|ds|es|ss|gs|fs|mm0|mm1|mm2|mm3|mm4|mm5|mm6|mm7|xmm0|xmm1|xmm2|xmm3|xmm4|xmm5|xmm6|xmm7|rbx|rsp|rcx|rax|rdx|rbp|rsi|rdi|rip|r8|r8d|r9|r9d|r10|r10d|r11|r11d|r12|r12d|r13|r13d|r14|r14d|r15|r15d|cr0|cr2|cr3|cr4|dr0|dr1|dr2|dr3|dr6|dr7|st0|st1|st2|st3|st4|st5|st6|st7|ymm0|ymm1|ymm2|ymm3|ymm4|ymm5|ymm6|ymm7|ymm8|ymm9
`.split('|');

const fasmMacros = `model|flat|stdcall|option|casemap|none|const|include|includelib|proto|data|code|segment|ends|public|use32|use16|assume|byte|word|dword|qword|tword|db|dw|dd|dq|dt|rb|equ|macro|vararg|endm|invoke|dup|proc|endp|local|addr|offset|end|mmx|xmm|sizeof|ptr|true|false|format|pe|pe64|console|ms|coff|binary|extrn|as|gui|section|readable|executable|writeable|import|library|entry|resource|directory|interface|struct|union|cominvk|virtual|at|export|fixups|discardable|dll|use64|large|while|endw|repeat|for|break|if|elseif|else|endif|native|notpageable|uses|align|stack|restore|purge|common|forward|reverse|eq|eqtype|fword|pword|tbyte|dqword|from|shareable|heap|mz|ms64|elf|elf64|du|rw|rd|dp|df|rp|rf|rq|rt|rva|near|far|define|irp|irps|match|rept|restruc|note|dynamic|linkinfo|efiruntime|linkremove|interpreter|static|efiboot|comcall|locals|endl|qqword|xword|yword|ccall|cinvoke|struc|fix|org|file|menu|menuitem|menuseparator|dialog|dialogitem|enddialog|icon|bitmap|cursor|resdata|endres|accelerator|versioninfo`.split('|');

export function activate(context: vscode.ExtensionContext) {
    const provider = vscode.languages.registerCompletionItemProvider('fasm', {
        provideCompletionItems() {
            const completionItems = [
                ...fasmInstructions.map(instruction => {
                    const item = new vscode.CompletionItem(instruction, vscode.CompletionItemKind.Keyword);
                    return item;
                }),
                ...fasmRegisters.map(register => {
                    const item = new vscode.CompletionItem(register, vscode.CompletionItemKind.Variable);
                    return item;
                }),
				...fasmMacros.map(macros => {
                    const item = new vscode.CompletionItem(macros, vscode.CompletionItemKind.Variable);
                    return item;
                })
            ];
            return completionItems;
        }
    });

    context.subscriptions.push(provider);
}

export function deactivate() {}
